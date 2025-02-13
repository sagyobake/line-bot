const url = 'https://discord.com/api/webhooks/1329054269617340437/md41TsLSDH8WTLwFIwYn7p9cDReVw3hQ_E1lz_fpLdy97_C_8xZ3oxlTVIWc0c9endgU';

const tenki_url = "https://map.yahooapis.jp/weather/V1/place?output=json&coordinates=139.50766992096874,35.60448371439913&appid=dj00aiZpPWZNWjMwWWdvenNJWSZzPWNvbnN1bWVyc2VjcmV0Jng9NWQ-"



app.post('/webhook', async c => {
    const data = await c.req.json() // WebHookデータ
  
    const replys: Promise<Response>[] = []
    for (const event of data.events) {
      // イベントでループ
      if (event.type !== 'message') return // メッセージでないイベントは無視
  
      const { message, replyToken } = event
  
      if (message.type !== 'text') return // テキストメッセージでないイベントは無視
  
      const textMessage: string = message.text // ユーザーの発言を取得
  
      const replyData = {
        replyToken,
        messages: [{
          type: "text",
          text: `あなたはさっき、${textMessage}と言った！`
        }],
      } // リプライするデータを作成
      replys.push(fetch("https://api.line.me/v2/bot/message/reply", {
        method: "POST",
        headers: {
          "Content-type": "application/json",
          "Authorization": "Bearer " + Deno.env.get("LINE_TOKEN"),
        },
        "body": JSON.stringify(replyData),
      })) // リプライ
    }
    await Promise.all(replys) // 全てのリプライ完了を待つ
  
    return c.text('OK')
  })