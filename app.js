// 1. Éléments de la page
const formulaire = document.getElementById("formulaire-defi");
const champNom = document.getElementById("nom-defi");
const champMontant = document.getElementById("montant-defi");
const champFrequence = document.getElementById("frequence-defi");
const liste = document.getElementById("liste-defis");
const totalAffiche = document.getElementById("total");
const totalCumuleAffiche = document.getElementById("total-cumule");
const canvas = document.getElementById("graphique");
const listeHistorique = document.getElementById("liste-historique");
const listeArchives = document.getElementById("liste-archives");
const nbHistorique = document.getElementById("nb-historique");
const nbArchives = document.getElementById("nb-archives");
const boutonArchiver = document.getElementById("bouton-archiver");
const boutonVider = document.getElementById("bouton-vider");
const boutonViderArchives = document.getElementById("bouton-vider-archives");

// 2. Données sauvegardées
let defis = JSON.parse(localStorage.getItem("defis")) || [];
let historique = JSON.parse(localStorage.getItem("historique")) || [];
let archives = JSON.parse(localStorage.getItem("archives")) || [];
let economiesParJour = JSON.parse(localStorage.getItem("economiesParJour"));

// Mise à niveau des défis créés avant l'accumulation automatique
defis.forEach(function (defi) {
  if (defi.frequence === undefined) {
    defi.frequence = 0;
    defi.dateDebut = new Date().toISOString();
    defi.periodesCreditees = 0;
  }
});

// Premier lancement avec le graphique : on part de ce qui est déjà épargné
if (economiesParJour === null) {
  economiesParJour = {};
  let dejaEpargne = 0;
  defis.forEach(function (defi) {
    dejaEpargne += defi.epargne;
  });
  if (dejaEpargne > 0) {
    economiesParJour[cleDate(new Date())] = arrondir(dejaEpargne);
  }
}

function sauvegarder() {
  localStorage.setItem("defis", JSON.stringify(defis));
  localStorage.setItem("historique", JSON.stringify(historique));
  localStorage.setItem("archives", JSON.stringify(archives));
  localStorage.setItem("economiesParJour", JSON.stringify(economiesParJour));
}

// 3. Petites fonctions utiles
function formaterMontant(nombre) {
  return nombre.toFixed(2).replace(".", ",") + " €";
}

function arrondir(nombre) {
  return Math.round(nombre * 100) / 100;
}

// Transforme une date en numéro de jour (pour compter les jours entiers)
function numeroJour(date) {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000
  );
}

// Transforme une date en texte "2026-10-07" (sert de clé dans le registre)
function cleDate(date) {
  return (
    date.getFullYear() + "-" +
    String(date.getMonth() + 1).padStart(2, "0") + "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

// Fait l'inverse : "2026-10-07" devient une date
function dateDepuisCle(cle) {
  const morceaux = cle.split("-");
  return new Date(
    Number(morceaux[0]),
    Number(morceaux[1]) - 1,
    Number(morceaux[2])
  );
}

function enregistrerEconomie(date, montant) {
  const cle = cleDate(date);
  economiesParJour[cle] = arrondir((economiesParJour[cle] || 0) + montant);
}

function ajouterHistorique(type, nomDefi, montant, nombre) {
  historique.unshift({
    date: new Date().toLocaleString("fr-FR"),
    type: type,
    nom: nomDefi,
    montant: montant,
    nombre: nombre || 1
  });
  if (historique.length > 100) {
    historique.pop();
  }
}

function prochainAjout(defi) {
  const debut = new Date(defi.dateDebut);
  const prochain = new Date(
    debut.getFullYear(),
    debut.getMonth(),
    debut.getDate() + (defi.periodesCreditees + 1) * defi.frequence
  );
  return prochain.toLocaleDateString("fr-FR");
}

// 4. Accumulation automatique
function verifierAccumulation() {
  const aujourdhui = numeroJour(new Date());
  let modifie = false;

  defis.forEach(function (defi) {
    if (defi.frequence <= 0) {
      return; // pas d'automatisme : on passe au défi suivant
    }

    const debut = new Date(defi.dateDebut);
    const joursEcoules = aujourdhui - numeroJour(debut);
    const periodes = Math.floor(joursEcoules / defi.frequence);
    const aCrediter = periodes - defi.periodesCreditees;

    if (aCrediter > 0) {
      // On range chaque période à sa vraie date dans le registre
      for (let k = defi.periodesCreditees + 1; k <= periodes; k++) {
        const dateAjout = new Date(
          debut.getFullYear(),
          debut.getMonth(),
          debut.getDate() + k * defi.frequence
        );
        enregistrerEconomie(dateAjout, defi.montant);
      }

      const somme = arrondir(aCrediter * defi.montant);
      defi.epargne = arrondir(defi.epargne + somme);
      defi.periodesCreditees = periodes;
      ajouterHistorique("auto", defi.nom, somme, aCrediter);
      modifie = true;
    }
  });

  if (modifie) {
    sauvegarder();
    afficher();
  }
}

// 5. Affichage des défis et du total
function afficherDefis() {
  liste.innerHTML = "";
  let totalGeneral = 0;

  defis.forEach(function (defi, index) {
    totalGeneral += defi.epargne;

    let detail = formaterMontant(defi.montant) + " par dépense évitée";
    if (defi.frequence > 0) {
      detail += "\nAuto : tous les " + defi.frequence +
        " jour(s), prochain ajout le " + prochainAjout(defi);
    }

    const ligne = document.createElement("li");
    ligne.className = "defi";
    ligne.innerHTML =
      '<div class="defi-tete"><strong></strong><span class="somme"></span></div>' +
      '<p class="detail"></p>';
    ligne.querySelector("strong").textContent = defi.nom;
    ligne.querySelector(".somme").textContent = formaterMontant(defi.epargne);
    ligne.querySelector(".detail").innerText = detail;

    const actions = document.createElement("div");
    actions.className = "actions";

    const boutonEvite = document.createElement("button");
    boutonEvite.textContent = "Dépense évitée";
    boutonEvite.className = "principal";
    boutonEvite.addEventListener("click", function () {
      defi.epargne = arrondir(defi.epargne + defi.montant);
      enregistrerEconomie(new Date(), defi.montant);
      ajouterHistorique("evite", defi.nom, defi.montant);
      sauvegarder();
      afficher();
    });

    const boutonRecuperer = document.createElement("button");
    boutonRecuperer.textContent = "Récupérer";
    boutonRecuperer.disabled = defi.epargne <= 0;
    boutonRecuperer.addEventListener("click", function () {
      const message =
        "As-tu bien viré " + formaterMontant(defi.epargne) +
        " vers ton compte d'épargne ?";
      if (confirm(message)) {
        ajouterHistorique("recupere", defi.nom, defi.epargne);
        defi.epargne = 0;
        sauvegarder();
        afficher();
      }
    });

    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.className = "supprimer";
    boutonSupprimer.addEventListener("click", function () {
      if (confirm("Supprimer le défi « " + defi.nom + " » ?")) {
        defis.splice(index, 1);
        sauvegarder();
        afficher();
      }
    });

    actions.appendChild(boutonEvite);
    actions.appendChild(boutonRecuperer);
    actions.appendChild(boutonSupprimer);
    ligne.appendChild(actions);
    liste.appendChild(ligne);
  });

  totalAffiche.textContent = totalGeneral.toFixed(2).replace(".", ",");
}

// 6. Le graphique
function calculerCourbe() {
  const cles = Object.keys(economiesParJour).sort();
  if (cles.length === 0) {
    return [];
  }

  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);

  // Le graphique couvre au minimum les 7 derniers jours
  let debut = dateDepuisCle(cles[0]);
  const minimum = new Date(aujourdhui);
  minimum.setDate(minimum.getDate() - 6);
  if (minimum < debut) {
    debut = minimum;
  }

  const points = [];
  let cumul = 0;
  for (
    let jour = new Date(debut);
    jour <= aujourdhui;
    jour.setDate(jour.getDate() + 1)
  ) {
    cumul = arrondir(cumul + (economiesParJour[cleDate(jour)] || 0));
    points.push({ jour: new Date(jour), valeur: cumul });
  }
  return points;
}

function dessinerGraphique() {
  const points = calculerCourbe();
  const ctx = canvas.getContext("2d");
  const largeur = canvas.clientWidth;
  const hauteur = 240;
  const ratio = window.devicePixelRatio || 1;

  // On adapte la taille réelle du dessin à l'écran (pour qu'il soit net)
  canvas.width = largeur * ratio;
  canvas.height = hauteur * ratio;
  canvas.style.height = hauteur + "px";
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, largeur, hauteur);
  ctx.font = "12px Arial";
  ctx.fillStyle = "#666";

  if (points.length === 0) {
    ctx.textAlign = "center";
    ctx.fillText("Pas encore de données", largeur / 2, hauteur / 2);
    return;
  }

  const margeGauche = 50;
  const margeDroite = 12;
  const margeHaut = 12;
  const margeBas = 28;
  const zoneLargeur = largeur - margeGauche - margeDroite;
  const zoneHauteur = hauteur - margeHaut - margeBas;
  const maximum = Math.max(points[points.length - 1].valeur, 1);

  // Convertit un numéro de point et une valeur en position sur le dessin
  function posX(indice) {
    return margeGauche + (indice / (points.length - 1)) * zoneLargeur;
  }
  function posY(valeur) {
    return margeHaut + zoneHauteur - (valeur / maximum) * zoneHauteur;
  }

  // Lignes horizontales et montants
  ctx.textAlign = "right";
  ctx.strokeStyle = "#e3e3e3";
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const valeur = (maximum / 4) * i;
    const y = posY(valeur);
    ctx.beginPath();
    ctx.moveTo(margeGauche, y);
    ctx.lineTo(largeur - margeDroite, y);
    ctx.stroke();
    ctx.fillText(
      valeur.toFixed(maximum >= 10 ? 0 : 2) + " €",
      margeGauche - 6,
      y + 4
    );
  }

  // Dates en bas : début, milieu, fin
  const indices = [0, Math.floor((points.length - 1) / 2), points.length - 1];
  const alignements = ["left", "center", "right"];
  indices.forEach(function (indice, k) {
    ctx.textAlign = alignements[k];
    ctx.fillText(
      points[indice].jour.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit"
      }),
      posX(indice),
      hauteur - 8
    );
  });

  // La courbe
  ctx.beginPath();
  ctx.moveTo(posX(0), posY(points[0].valeur));
  points.forEach(function (point, indice) {
    ctx.lineTo(posX(indice), posY(point.valeur));
  });
  ctx.strokeStyle = "#0F3D5E";
  ctx.lineWidth = 2;
  ctx.stroke();

  // La zone colorée sous la courbe
  ctx.lineTo(posX(points.length - 1), posY(0));
  ctx.lineTo(posX(0), posY(0));
  ctx.closePath();
  ctx.fillStyle = "rgba(15, 61, 94, 0.12)";
  ctx.fill();

  // Un point sur la dernière valeur
  ctx.beginPath();
  ctx.arc(
    posX(points.length - 1),
    posY(points[points.length - 1].valeur),
    4, 0, Math.PI * 2
  );
  ctx.fillStyle = "#0F3D5E";
  ctx.fill();
}

function afficherTotalCumule() {
  let somme = 0;
  Object.keys(economiesParJour).forEach(function (cle) {
    somme += economiesParJour[cle];
  });
  totalCumuleAffiche.textContent = formaterMontant(arrondir(somme));
}

// 7. Affichage de l'historique et des archives
function dessinerOperations(conteneur, operations) {
  conteneur.innerHTML = "";

  operations.forEach(function (operation) {
    let action = "Récupéré";
    if (operation.type === "evite") {
      action = "Dépense évitée";
    }
    if (operation.type === "auto") {
      action = "Ajout automatique";
    }

    let texte =
      operation.date + " – " + action + " : " + operation.nom +
      " (" + formaterMontant(operation.montant) + ")";
    if (operation.nombre > 1) {
      texte += " – " + operation.nombre + " périodes";
    }

    const ligne = document.createElement("li");
    ligne.textContent = texte;
    conteneur.appendChild(ligne);
  });
}

function afficher() {
  afficherDefis();
  afficherTotalCumule();
  dessinerGraphique();
  dessinerOperations(listeHistorique, historique);
  dessinerOperations(listeArchives, archives);

  nbHistorique.textContent = historique.length;
  nbArchives.textContent = archives.length;
  boutonArchiver.disabled = historique.length === 0;
  boutonVider.disabled = historique.length === 0;
  boutonViderArchives.disabled = archives.length === 0;
}

// 8. Boutons de l'historique
boutonArchiver.addEventListener("click", function () {
  archives = historique.concat(archives).slice(0, 1000);
  historique = [];
  sauvegarder();
  afficher();
});

boutonVider.addEventListener("click", function () {
  if (confirm("Supprimer définitivement l'historique ? Les montants épargnés ne changent pas.")) {
    historique = [];
    sauvegarder();
    afficher();
  }
});

boutonViderArchives.addEventListener("click", function () {
  if (confirm("Supprimer définitivement les archives ?")) {
    archives = [];
    sauvegarder();
    afficher();
  }
});

// 9. Ajout d'un défi
formulaire.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  defis.push({
    nom: champNom.value,
    montant: parseFloat(champMontant.value),
    epargne: 0,
    frequence: parseInt(champFrequence.value, 10),
    dateDebut: new Date().toISOString(),
    periodesCreditees: 0
  });

  sauvegarder();
  afficher();
  formulaire.reset();
});

// 10. Démarrage
afficher();
verifierAccumulation();
setInterval(verifierAccumulation, 60000); // vérifie chaque minute
document.addEventListener("visibilitychange", function () {
  if (!document.hidden) {
    verifierAccumulation(); // vérifie quand on revient sur la page
  }
});
window.addEventListener("resize", dessinerGraphique); // redessine si la fenêtre change de taille

// Fonctionnement hors connexion et installation
if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js");
  });
}