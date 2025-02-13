const tenki_url = "https://map.yahooapis.jp/weather/V1/place?output=json&coordinates=139.50766992096874,35.60448371439913&appid=dj00aiZpPWZNWjMwWWdvenNJWSZzPWNvbnN1bWVyc2VjcmV0Jng9NWQ-"

let veryLongText = ''; // 細切れの値をここに結合していく。
const decoder = new TextDecoder();


let yoho = 'a';


await fetch(tenki_url)
    .then((response) => response.body.getReader()) // ReadableStreamを取得する。
    .then((reader) => {
        // ReadableStream.read()はPromiseを返す。
        // Promiseは{ done, value }として解決される。
        // データを読み込んだとき：doneはfalse, valueは値。
        // データを読み込み終わったとき：doneはtrue, valueはundefined。
        async function readChunk({ done, value }) {
            if (done) {
                // 読み込みが終わっていれば最終的なテキストを表示する。
                const data = JSON.parse(veryLongText);
                //console.log(data);

                const w = data['Feature'];

                const weather = w[0]['Property']['WeatherList']['Weather'];

                //console.log(weather); //一時間の天気予報が入った配列

                for (const value in weather) {
                    console.log(weather[value]['Rainfall']);
                }

                //console.log(yoho);

                return;
            }

            const a = decoder.decode(value);
            veryLongText += a;

            // 次の値を読みにいく。
            reader.read().then(readChunk);
        }

        // 最初の値を読み込む。
        reader.read().then(readChunk);
    });




import { serve } from "https://deno.land/std@0.117.0/http/server.ts";

const accessToken = Deno.env.get("ACCESS_TOKEN");
const channelSecret = Deno.env.get("CHANNEL_SECRET");

function indexPage() {
    return new Response(`This is an example LINE bot implementation
See https://github.com/kt3k/line-bot-deno-deploy for details`);
}

function notFoundPage() {
    return new Response("404 Not Found", { status: 404 });
}

const enc = new TextEncoder();
const algorithm = { name: "HMAC", hash: "SHA-256" };

async function hmac(secret: string, body: string) {
    const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        algorithm,
        false,
        ["sign", "verify"],
    );
    const signature = await crypto.subtle.sign(
        algorithm.name,
        key,
        enc.encode(body),
    );
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

async function webhook(request: Request) {
    if (!accessToken) {
        throw new Error("ACCESS_TOKEN is not set");
    }
    if (!channelSecret) {
        throw new Error("CHANNEL_SECRET is not set");
    }

    const json = await request.text();
    const digest = await hmac(channelSecret, json);
    const signature = request.headers.get("x-line-signature");

    if (digest !== signature) {
        return new Response("Bad Request", { status: 400 });
    }

    const event = JSON.parse(json);
    console.log(event);
    if (event.events.length === 0) {
        return new Response("OK");
    }

    const hoge = (n: number) => {
        let result = "";
        let a = 1;
        for (let i = 1; i <= n; i++) {
            a *= i;
            result += `${a}\n`;
        }
        return result;
    }


    const res = await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
            "content-type": "application/json",
            "authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            replyToken: event.events[0].replyToken,
            messages: [
                {
                    type: "text",
                    text: hoge(Number(event.events[0].message.text)),
                },


                {
                    type: 'text',
                    text: yoho,
                },


            ],
        }),
    });
    await res.arrayBuffer();
    return new Response("OK");
}

serve((request) => {
    const { pathname } = new URL(request.url);

    switch (pathname) {
        case "/":
            return indexPage();
        case "/webhook":
            return webhook(request);
        default:
            return notFoundPage();
    }
});