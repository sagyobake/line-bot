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


    

import { config } from "https://deno.land/x/dotenv@v2.0.0/mod.ts";
const { LINE_ACCESS_TOKEN } = config();

const url = "https://notify-api.line.me/api/notify";

const body: URLSearchParams = new URLSearchParams({
    message: "hello from deno!",
});

const res = await fetch(url, {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${LINE_ACCESS_TOKEN}`,
        "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
});

const json = await res.json();
console.log(json);