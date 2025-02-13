let yoho = 'hogehoge';

await fetch('https://weather.tsukumijima.net/api/forecast/city/130010')
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


import type { Handlers, FreshContext } from "$fresh/server.ts";
import { messagingApi, MessageEvent } from "npm:@line/bot-sdk@8.4.0";
import type { ClientConfig, TextEventMessage } from "npm:@line/bot-sdk@8.4.0";
import OpenAI from "https://deno.land/x/openai@v4.33.1/mod.ts";

const config: ClientConfig = {
    channelAccessToken: "YOUR_CHANNEL_ACCESS_TOKEN",
    channelSecret: "YOUR_CHANNEL_SECRET",
};
const client = new messagingApi.MessagingApiClient(config);

const ai = new OpenAI();

export const handler: Handlers = {
    async POST(_req: Request, _ctx: FreshContext): Promise<Response> {
        const body = await _req.json();
        const event: MessageEvent = body.events[0];
        const textMessage = event.message as TextEventMessage;
        const chatCompletion = await ai.chat.completions.create({
            messages: [{ role: "user", content: `あなたは何でも知ってる物知り博士です。次の"#動物の名称"欄に記載される動物の生態を詳しく教えてください。ただし、"#動物の名称"欄に動物の名称ではないものが記載された場合は、"それは動物の名称ではありません"と回答してください。\n\n#動物の名称: ${textMessage.text}` }],
            model: "gpt-4-1106-preview",
        });
        const completion = chatCompletion.choices[0].message.content;
        await client.replyMessage({
            replyToken: event.replyToken,
            messages: [
                {
                    type: "text",
                    text: completion,
                },
            ],
        });
        return new Response(null, { status: 204 });
    }
};
