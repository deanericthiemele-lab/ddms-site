
import fs from "fs";
import XLSX from "xlsx";

export async function handler(event) {

try {

const apiKey = process.env.CLAUDE_API_KEY;

if(!apiKey){
return {
statusCode:500,
body:JSON.stringify({result:"Clé Claude manquante"})
};
}

const body = JSON.parse(event.body || "{}");
const question = body.question || "";

let context = "";

const files = fs.readdirSync("./");

const excelFiles = files.filter(f => f.endsWith(".xlsx"));

for(const file of excelFiles){

try{

const workbook = XLSX.readFile(file);

for(const sheetName of workbook.SheetNames){

const sheet = workbook.Sheets[sheetName];

const rows = XLSX.utils.sheet_to_json(sheet);

context += JSON.stringify(rows).slice(0,1500);

}

}catch(e){}

}

const response = await fetch("https://api.anthropic.com/v1/messages",{

method:"POST",

headers:{
"x-api-key": apiKey,
"anthropic-version":"2023-06-01",
"content-type":"application/json"
},

body:JSON.stringify({

model:"claude-3-5-sonnet-20241022",

max_tokens:700,

messages:[{
role:"user",
content:`
Tu es l'assistant IA du système DDMS Orange.

Données extraites du système :

${context}

Question utilisateur :
${question}

Analyse les KPI réseau et réponds clairement.
`
}]

})

});

const data = await response.json();

return {
statusCode:200,
body:JSON.stringify({
result:data?.content?.[0]?.text || "Aucune réponse IA"
})
};

}catch(error){

return {
statusCode:500,
body:JSON.stringify({
result:"Erreur IA : "+error.message
})
};

}

}
