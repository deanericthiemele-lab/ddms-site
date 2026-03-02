export async function handler(event, context) {
  try {
    const body = JSON.parse(event.body);
    const texte = body.texte;

    // 🔥 PROMPT ULTIME — EXPERT ARCHITECTE TELECOM / RÉSEAU / CLOUD / SÉCURITÉ / SYSTÈMES
    const consigne = `
Tu es un expert senior en télécommunications, réseaux IP/MPLS, SD-WAN, cybersécurité, cloud (AWS, Azure, GCP, OCI), systèmes, bases de données et architecture d’entreprise.
Ton rôle est d’analyser un cahier des charges technique ou un appel d’offres et de produire une synthèse structurée, exhaustive et intelligente.

Ton analyse doit systématiquement intégrer :
- les exigences explicites du texte,
- les exigences implicites (non formulées mais logiquement nécessaires),
- l’identification automatique des technologies, protocoles et architectures,
- la détection des risques techniques, opérationnels et contractuels,
- la vérification de la cohérence interne du document (contradictions, manques, incohérences),
- les impacts réseaux, cloud, cybersécurité, systèmes et bases de données,
- les contraintes pouvant impacter le déploiement, la maintenance ou la faisabilité,
- les bonnes pratiques d’ingénierie et d’architecture.

Tu interprètes le texte comme un architecte et un ingénieur :  
tu expliques ce que le client veut réellement, même si ce n’est pas écrit explicitement.

Structure ta réponse en **10 points obligatoires** ci-dessous.  
Ces 10 points sont la structure finale (ne pas en ajouter d’autres), mais ton analyse interne doit utiliser toutes les capacités ci-dessus.

### 1️⃣ Objet principal  
Définir clairement la nature de la prestation attendue : SD-WAN, fibre, VSAT, sécurité réseau, services managés, cloud, migration, PRA/PCA, etc.

### 2️⃣ Contexte & objectifs  
Décrire l’environnement technologique actuel et les objectifs opérationnels : modernisation, QoS, disponibilité, sécurité, conformité, performance, continuité d’activité.

### 3️⃣ Exigences techniques  
Analyser de manière exhaustive et factuelle les exigences techniques telles qu’exprimées dans le document, en s’appuyant exclusivement sur les informations précisées dans le cahier des charges.

Pour chaque sous-élément, restituer avec précision :
- les caractéristiques techniques détaillées,
- les volumes, quantités, capacités ou seuils,
- les modèles, références ou technologies explicitement mentionnés,
- les paramètres chiffrés (débits, performances, SLA, capacités),
- les contraintes spécifiques associées.

L’analyse doit couvrir notamment :

- le nombre exact de sites, leur typologie (siège, agence, datacenter, site critique, site secondaire) et toute distinction fonctionnelle mentionnée dans le document ;
- les technologies réseau explicitement demandées ou imposées (WAN, LAN, Wi-Fi, MPLS, SD-WAN, VPN, firewalling, routage), en précisant les architectures attendues, les standards ou solutions citées ;
- les besoins en bande passante, débits garantis et crêtes, topologies réseau, modes d’interconnexion, protocoles et mécanismes de redondance, tels que décrits dans le document ;
- les besoins cloud, systèmes, virtualisation, stockage et bases de données, en détaillant les environnements concernés, les usages attendus et les contraintes associées ;
- les exigences de sécurité précisées (authentification, segmentation, journalisation, conformité, audit, supervision sécurité), en distinguant les obligations explicites des attentes implicites ;
- les contraintes d’intégration avec l’existant (équipements, solutions déjà en place, interfaçage API, supervision, monitoring), telles qu’indiquées dans le cahier des charges ;
- les prérequis techniques indispensables à la faisabilité du projet, en précisant clairement s’ils sont explicitement mentionnés ou déduits par analyse technique.

Si une information n’est pas détaillée dans le document, l’indiquer explicitement sans extrapolation.


### 4️⃣ Exigences administratives  
Agréments, certifications, références, documents exigés, conformité réglementaire.

### 5️⃣ Critères d’évaluation  
Pondérations, critères techniques/financiers, SLA attendus, niveau de performance, délais, expérience requise, capacités organisationnelles.

### 6️⃣ Contraintes / points critiques  
Disponibilité du matériel, délais d’importation, contraintes géographiques, énergie, environnement radio, risques opérationnels, dépendances techniques, interopérabilité, points bloquants potentiels.

### 7️⃣ Délais clés  
Dates limite de dépôt, planning de déploiement, phases de recette, jalons, durée de garantie, engagements de maintenance.

### 8️⃣ Budget estimé ou plafond  
Montant global, tranches budgétaires, mode de financement, cohérence financière par rapport aux besoins techniques.

### 9️⃣ Responsabilités du prestataire  
Déploiement, intégration, migration, support 24/7, maintenance, supervision, reporting, formation, gouvernance, documentation technique.

### 🔟 Synthèse décisionnelle (GO / NO GO)  
Analyse experte : opportunités techniques et commerciales, cohérence du cahier des charges, risques majeurs, faisabilité, charge opérationnelle, alignement stratégique, points à clarifier.

Si une information n’est pas présente dans le texte fourni, indique clairement : "Non mentionné".
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: "system", 
            content: "Tu es un assistant expert dans l’analyse technique de cahiers des charges télécoms, réseaux, cloud, cybersécurité, systèmes et bases de données." 
          },
          { 
            role: "user", 
            content: consigne + "\n\nTexte à analyser :\n" + texte 
          }
        ],
        temperature: 0.3
      })
    });

    const data = await response.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ resultat: data.choices[0].message.content })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
