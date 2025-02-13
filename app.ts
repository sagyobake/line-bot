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



const postReplyMessage = async (
    message: string,
    replyToken: string,
) => {
    const body = {
        replyToken,
        messages: [
            {
                type: "text",
                yoho: message,
            },
        ],
    };

    return await fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `EGLpy+QFWeKGUcWztUfJDDJbW0JKuZco6PxrEKgBKg5wWMR6oRj9luSrUYUw8ho4gySPE7Orox662OipmXwmJP9jNEw58rbJVpuCAgUwDClXXmp+fflNyZTJTgm7yHjy36RCnxNe/B2tgDVhxyM6hgdB04t89/1O/w1cDnyilFU=`,
        },
        body: JSON.stringify(body),
    });
};