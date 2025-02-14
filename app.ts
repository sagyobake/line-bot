//ハングル生成器-----------------------------
const hangul = [
    { "아A": "あ" },
    { "이I": "い" },
    { "우U": "う" },
    { "에E": "え" },
    { "오O": "お" },
];

//乱数ーーーーーーーーーーーーーーーーー
function getRandomInt(min, max) {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // 上限は除き、下限は含む
}

const questionGenerator = () => {
    const n = getRandomInt(0, hangul.length);
    const key = Object.keys(hangul[n]);
    const value = Object.values(hangul[n]);

    return [key[0], value[0]];
};

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
        // メッセージイベントのみ処理する
        if (event.type !== "message" || event.message.type !== "text") {
            continue;
        }

        const value = event.message.text;

        // LINE bot SDKを用いて返信する
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [{ type: "text", text: value }],
        });
    }

    return c.json({ status: "success" });
});

// LINE bot SDKを用いて返信する
await client.replyMessage({
    messages: [{ type: "text", text: 'hoge' }],
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
