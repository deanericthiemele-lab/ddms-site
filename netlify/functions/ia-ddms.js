
import XLSX from "xlsx";

export async function handler(event) {
  try {

    const body = JSON.parse(event.body || "{}");
    const question = body.question || "Réponds OK";

    const apiKey = process.env.CLAUDE_API_KEY;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 200,
        messages: [
          {
            role: "user",
            content: question
          }
        ]
      })
    });

    const data = await response.json();

    let result = "Pas de réponse";

    if (data && data.content && data.content.length > 0) {
      result = data.content[0].text;
    } else if (data && data.error) {
      result = "Erreur Claude : " + data.error.message;
    } else {
      result = JSON.stringify(data);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        result: result
      })
    };

  } catch (error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message
      })
    };

  }
}
