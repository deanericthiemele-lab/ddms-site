document.getElementById("sendBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];

  if (!file) {
    alert("Veuillez sélectionner un fichier PDF.");
    return;
  }

  const reader = new FileReader();
  reader.onload = async function () {
    const arrayBuffer = reader.result;

    try {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(" ");
        fullText += pageText + "\n";
      }

      // Appel à la fonction Netlify sécurisée
      const response = await fetch("/.netlify/functions/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texte: fullText })
      });

      const data = await response.json();
      afficherResumeEnPoints(data.resultat);

    } catch (error) {
      console.error("Erreur :", error);
      document.getElementById("result").innerText = "Erreur lors du traitement du fichier.";
    }
  };

  reader.readAsArrayBuffer(file);
});

function afficherResumeEnPoints(texte) {
  let lignes = texte.split(/\n+/).filter(l => l.trim() !== "");

  let html = "";
  let currentBlock = "";

  lignes.forEach(l => {
    // Vérifie si la ligne est un point principal (1. 2. ... ou 1️⃣ 2️⃣ ... ou 🔟)
    if (/^(\d+\.|\d+️⃣|🔟)/.test(l.trim())) {
      // Si un bloc précédent existe → on le ferme
      if (currentBlock) {
        html += currentBlock + "</div>";
      }

      // Nouveau bloc avec le titre du point
      currentBlock = `<div style="margin-bottom:15px; padding:12px; border:1px solid #ddd; border-radius:6px; background:#fff;">
                        <p><strong>${l.trim()}</strong></p>`;
    } else {
      // C’est une réponse → on l’ajoute dans le bloc courant
      if (currentBlock) {
        currentBlock += `<p style="margin-left:10px;">${l.trim()}</p>`;
      }
    }
  });

  // Ferme le dernier bloc
  if (currentBlock) {
    html += currentBlock + "</div>";
  }

  document.getElementById("result").innerHTML = html;
}