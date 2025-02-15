//素因数分解の問題を生成するClass
class Question {
    primeNumber(n) {
        let prime = [2];
        for (let i = 2; i <= n; i++) {
            let check = true;
            if (i % 2 !== 0) {
                for (let j = 2; j < (i / 2); j++) {
                    if (i % j === 0) {
                        check = false;
                    }
                }
                if (check === true) {
                    prime.push(i);
                }
            }
        }
        return prime;
    }

    getRandomInt(min, max) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // 上限は除き、下限は含む
    }

    Duplication() {
        const prime = this.primeNumber(17);
        const p = prime[this.getRandomInt(1, prime.length - 1)];
        const q = prime[this.getRandomInt(1, prime.length - 1)];

        if (p !== q) {
            return { p, q };
        } else {
            return this.Duplication();
        }
    }

    Result() {
        const index = this.Duplication();

        console.log(index);

        const p = index["p"];
        const q = index["q"];
        const pq = p * q;

        return { pq, p, q };
    }
}

const question = new Question();

let result = question.Result();
let p = result["p"];
let q = result["q"];
let pq = p * q;
let value = "これは例題です、適当な値を入力してゲームを開始してください。";

//-----------------------------------------------

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

        //ユーザーの入力値が　event.message.text　である。
        const input = Number(event.message.text);
        console.log(input);
        console.log(p, q);
        if (input === p || input === q) {
            value = "正解 (^o^)";
        } else {
            value = `不正解 (ﾟ∀ﾟ)　正解は${p}または${q}です。`;
        }

        result = question.Result();
        p = result["p"];
        q = result["q"];
        pq = p * q;
        const next_question =
            `AまたはBに当てはまる値を半角英数字で1つ入力してください。\n
        A × B = ${pq}
        `;

        // LINE bot SDKを用いて返信する
        await client.replyMessage({
            replyToken: event.replyToken,

            messages: [
                { type: "text", text: value },
                { type: "text", text: next_question },
            ],
        });
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
