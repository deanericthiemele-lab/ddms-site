import fs from "fs";
import XLSX from "xlsx";

export async function handler(event){

const API_KEY = process.env.CLAUDE_API_KEY;

const body = JSON.parse(event.body);
const question = body.question;

let context = "";

const files = fs.readdirSync("./");
const excelFiles = files.filter(f => f.endsWith(".xlsx"));

for(const file of excelFiles){

try{

const wb = XLSX.readFile(file);

for(const sheetName of wb.SheetNames){

const sheet = wb.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet);

context += JSON.stringify(rows).slice(0,2000);

}

}catch(e){}

}

const response = await fetch("https://api.anthropic.com/v1/messages",{

method:"POST",

headers:{
"x-api-key":API_KEY,
"anthropic-version":"2023-06-01",
"content-type":"application/json"
},

body:JSON.stringify({

model:"claude-3-5-sonnet-20241022",

max_tokens:800,

messages:[{
role:"user",
content:`Tu es l'assistant IA du système DDMS.

Voici des données issues des fichiers Excel du système :

${context}

Question :
${question}

Réponds clairement et propose une analyse si nécessaire.`
}]

})

});

const result = await response.json();

return {
statusCode:200,
body:JSON.stringify({answer: result.content[0].text})
};

}
