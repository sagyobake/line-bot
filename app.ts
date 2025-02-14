//ハングル生成器-----------------------------
const hangu = [
    { "아": "あ" },
    { "이": "い" },
    { "우": "う" },
    { "에": "え" },
    { "오": "お" },
];

let question = ""; //前回出題されたハングル文字を代入する
let answer = "";

//乱数ーーーーーーーーーーーーーーーーー
function getRandomIntInclusive(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled); // 上限を含み、下限も含む
}

const questionGenerator = () => {
    const n = getRandomIntInclusive(0, hangu.length);
    const key = Object.keys(hangu[n]);
    const value = Object.values(hangu[n]);
    console.log(key);
    console.log(value);

    question = JSON.stringify(key);
    answer = JSON.stringify(value);
};
questionGenerator();

//Line Bot--------------------------------
import { Hono, type HonoRequest } from "jsr:@hono/hono@4.4.12";
import {
    messagingApi,
    SignatureValidationFailed,
    validateSignature,
    type WebhookRequestBody,
} from "npm:@line/bot-sdk@9.2.2";

// LINE bot SDKの初期化
const CHANNEL_SECRET = Deno.env.get("CHANNEL_SECRET")!;
const client = new messagingApi.MessagingApiClient({
    channelAccessToken: Deno.env.get("CHANNEL_ACCESS_TOKEN")!,
});

// Honoの初期化
const app = new Hono();

app.get("/", (c) => c.text("hello world"));

// https://<ドメイン>/webhookに対するPOSTリクエストを受け付け
app.post("/webhook", async (c) => {
    // リクエストがLINEプラットフォームから送られたことを確認し、bodyをパース
    const request = await validateAndParseRequest(c.req);
    console.log(request);

    for (const event of request.events) {
        let result = question;
        // メッセージイベントのみ処理する
        if (event.type !== "message" || event.message.type !== "text") {
            continue;
        }

        // LINE bot SDKを用いて返信する
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: "text", text: result }],
        });

        // event.message.textの中に受信したメッセージが入っている
        console.log(event.message.text);
        if (event.message.text === answer) {
            result = "正解！";
            questionGenerator();
        } else {
            result = `不正解 ${answer}`;
        }
    }

    return c.json({ status: "success" });
});

/**
 * リクエストを検証してbodyをパースする
 * Note:リクエストがLINEプラットフォームから送られたことを確認するために、ボットサーバーでリクエストヘッダーのx-line-signatureに含まれる署名を検証します。
 * ref: https://developers.line.biz/ja/reference/messaging-api/#signature-validation
 */
async function validateAndParseRequest(req: HonoRequest) {
    // bodyを取得
    const body = await req.text();
    // x-line-signatureヘッダーを取得
    const signature = req.header("x-line-signature")!;
    // 署名を検証し、LINEから送られたものではないと判断したらエラーを投げる
    if (!validateSignature(body, CHANNEL_SECRET, signature)) {
        throw new SignatureValidationFailed("signature validation failed", {
            signature,
        });
    }
    // bodyをパースして返す
    return JSON.parse(body) as WebhookRequestBody;
}

export default app;
