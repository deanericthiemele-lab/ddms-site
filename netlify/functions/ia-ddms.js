
import fs from "fs";
import XLSX from "xlsx";
import fetch from "node-fetch";

export async function handler(event) {

  try {

    const apiKey = process.env.CLAUDE_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        body: JSON.stringify({ result: "CLAUDE_API_KEY manquante dans Netlify" })
      };
    }

    const body = JSON.parse(event.body || "{}");
    const question = body.question || "";

    let context = "";

    const files = fs.readdirSync("./");
    const excelFiles = files.filter(f => f.endsWith(".xlsx"));

    for (const file of excelFiles) {

      try {

        const workbook = XLSX.readFile(file);

        for (const sheetName of workbook.SheetNames) {

          const sheet = workbook.Sheets[sheetName];
          const rows = XLSX.utils.sheet_to_json(sheet);

          context += JSON.stringify(rows).slice(0,1500);

        }

      } catch(e) {}

    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {

      method: "POST",

      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },

      body: JSON.stringify({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 800,
        temperature: 0.3,
        system: "Tu es un assistant qui analyse les données réseau DDMS.",
        messages: [
          {
            role: "user",
            content: `Données système :
${context}

Question :
${question}`
          }
        ]
      })

    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        result: data?.content?.[0]?.text || "Aucune réponse de Claude"
      })
    };

  } catch(error) {

    return {
      statusCode: 500,
      body: JSON.stringify({
        result: "Erreur IA : " + error.message
      })
    };

  }

}
