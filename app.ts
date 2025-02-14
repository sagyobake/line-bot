let yoho = 'hogehoge';

fetch('https://weather.tsukumijima.net/api/forecast/city/130010')
    .then(response => response.json())
    .then(data => {

        //console.log(data);

        const date = data['forecasts'][0]['date'];
        const telop = data['forecasts'][0]['telop'];
        console.log(date);
        console.log(telop);


        yoho = `${date}\n${telop}`;


    })
    .catch(error => {
        console.error('エラー:', error);
    });

//ーーー天気予報APIーーーー



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
await client.replyMessage({
    //replyToken: event.replyToken,
    messages: [{ type: "text", text: 'hoge' }],
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

        // event.message.textの中に受信したメッセージが入っている
        console.log(event.message.text);

        // LINE bot SDKを用いて返信する
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

/**
 * 受信したメッセージに対する返信を作成する
 * @param message 受信したメッセージ
 * @returns tr
 */
function reply(message: string) {
    // 現在はオウム返し（受信した内容をそのまま返信）
    return message;
}

export default app;
