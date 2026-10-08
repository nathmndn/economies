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

// Épargne en concret
const epargneConcretMontant =
  document.getElementById("epargne-concret-montant");

const epargneConcretMessage =
  document.getElementById("epargne-concret-message");

const epargneConcretReferenceNom =
  document.getElementById("epargne-concret-reference-nom");

const epargneConcretReferenceValeur =
  document.getElementById("epargne-concret-reference-valeur");

const epargneConcretProchainValeur =
  document.getElementById("epargne-concret-prochain-valeur");

const epargneConcretProchainMessage =
  document.getElementById("epargne-concret-prochain-message");

// 2. Données sauvegardées du profil actif
const donneesProfil = EconomiesProfils.charger();

let defis = donneesProfil.defis || [];
let historique = donneesProfil.historique || [];
let archives = donneesProfil.archives || [];
let objectifs = donneesProfil.objectifs || [];
let economiesParJour = donneesProfil.economiesParJour;

// Mise à niveau des défis créés avant l'accumulation automatique
defis.forEach(function (defi) {
      if (!defi.id) {
    defi.id = "d" + Date.now() + Math.random().toString(36).slice(2, 6);
  }
  if (!defi.economies) {
    defi.economies = {};
  }
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
  EconomiesProfils.sauvegarder({
    defis: defis,
    historique: historique,
    archives: archives,
    economiesParJour: economiesParJour,
    objectifs: objectifs
  });
}

// 3. Petites fonctions utiles
function formaterMontant(nombre) {
  return nombre.toFixed(2).replace(".", ",") + " €";
}

function arrondir(nombre) {
  return Math.round(nombre * 100) / 100;
}

// ============================================================
// 3 bis. RÉFÉRENCES CONCRÈTES DE L'ÉPARGNE
// ============================================================
//
// Ces valeurs sont des ordres de grandeur.
// Elles pourront être ajustées plus tard.
//
// Le but est de transformer une somme économisée
// en quelque chose de concret et compréhensible.
//
// Aucun emoji ni aucune icône ne sont utilisés ici.
// ============================================================

const REFERENCES_ECONOMIES = [

  // ----------------------------------------------------------
  // TABAC
  // ----------------------------------------------------------

  {
    nom: "paquet de cigarettes",
    valeur: 12,
    categorie: "tabac"
  },

  {
    nom: "cartouche de cigarettes",
    valeur: 120,
    categorie: "tabac"
  },


  // ----------------------------------------------------------
  // SORTIES ET LOISIRS
  // ----------------------------------------------------------

  {
    nom: "place de cinéma",
    valeur: 12,
    categorie: "loisirs"
  },

  {
    nom: "repas au restaurant",
    valeur: 30,
    categorie: "loisirs"
  },

  {
    nom: "place de concert",
    valeur: 50,
    categorie: "loisirs"
  },

  {
    nom: "jeu vidéo",
    valeur: 80,
    categorie: "loisirs"
  },

  {
    nom: "activité de loisir",
    valeur: 50,
    categorie: "loisirs"
  },


  // ----------------------------------------------------------
  // OBJETS
  // ----------------------------------------------------------

  {
    nom: "livre",
    valeur: 20,
    categorie: "objets"
  },

  {
    nom: "paire de chaussures",
    valeur: 100,
    categorie: "objets"
  },

  {
    nom: "casque audio",
    valeur: 150,
    categorie: "objets"
  },

  {
    nom: "petit appareil électronique",
    valeur: 250,
    categorie: "objets"
  },


  // ----------------------------------------------------------
  // EXPÉRIENCES
  // ----------------------------------------------------------

  {
    nom: "massage ou soin",
    valeur: 70,
    categorie: "experiences"
  },

  {
    nom: "activité sportive",
    valeur: 100,
    categorie: "experiences"
  },

  {
    nom: "saut en parapente",
    valeur: 200,
    categorie: "experiences"
  },

  {
    nom: "journée dans un parc de loisirs",
    valeur: 80,
    categorie: "experiences"
  },


  // ----------------------------------------------------------
  // VOYAGES ET SÉJOURS
  // ----------------------------------------------------------

  {
    nom: "trajet en train",
    valeur: 50,
    categorie: "voyage"
  },

  {
    nom: "nuit dans un hôtel",
    valeur: 100,
    categorie: "voyage"
  },

  {
    nom: "week-end",
    valeur: 300,
    categorie: "voyage"
  },

  {
    nom: "séjour",
    valeur: 500,
    categorie: "voyage"
  },

  {
    nom: "voyage",
    valeur: 1000,
    categorie: "voyage"
  },


  // ----------------------------------------------------------
  // MAISON / PROJETS
  // ----------------------------------------------------------

  {
    nom: "petit équipement pour la maison",
    valeur: 50,
    categorie: "maison"
  },

  {
    nom: "équipement pour la maison",
    valeur: 150,
    categorie: "maison"
  },

  {
    nom: "meuble",
    valeur: 300,
    categorie: "maison"
  }

];


// ------------------------------------------------------------
// Retourne la référence la plus proche d'un montant.
// ------------------------------------------------------------

function trouverReferenceProche(montant) {

  if (
    montant <= 0 ||
    REFERENCES_ECONOMIES.length === 0
  ) {
    return null;
  }

  let meilleureReference = null;
  let meilleurEcart = Infinity;

  REFERENCES_ECONOMIES.forEach(function (reference) {

    const ecart =
      Math.abs(montant - reference.valeur);

    if (ecart < meilleurEcart) {
      meilleurEcart = ecart;
      meilleureReference = reference;
    }

  });

  return meilleureReference;
}


// ------------------------------------------------------------
// Retourne les références qui peuvent être atteintes
// avec une somme donnée.
//
// Exemple : 200 € pourra renvoyer plusieurs références
// proches de cette somme.
// ------------------------------------------------------------

function trouverReferencesProches(
  montant,
  nombre = 3
) {

  if (
    montant <= 0 ||
    REFERENCES_ECONOMIES.length === 0
  ) {
    return [];
  }

  return REFERENCES_ECONOMIES
    .map(function (reference) {

      return {
        reference: reference,
        ecart: Math.abs(
          montant - reference.valeur
        )
      };

    })
    .sort(function (a, b) {
      return a.ecart - b.ecart;
    })
    .slice(0, nombre)
    .map(function (element) {
      return element.reference;
    });
}


// ------------------------------------------------------------
// Retourne la prochaine référence supérieure au montant.
//
// Exemple :
// 180 € → 200 € : saut en parapente
// ------------------------------------------------------------

function trouverProchaineReference(montant) {

  const references =
    REFERENCES_ECONOMIES
      .filter(function (reference) {
        return reference.valeur > montant;
      })
      .sort(function (a, b) {
        return a.valeur - b.valeur;
      });

  return references.length > 0
    ? references[0]
    : null;
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

function enregistrerEconomie(date, montant, defi) {
  const cle = cleDate(date);
  economiesParJour[cle] = arrondir((economiesParJour[cle] || 0) + montant);
  if (defi) {
    defi.economies = defi.economies || {};
    defi.economies[cle] = arrondir((defi.economies[cle] || 0) + montant);
  }
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
    if (defi.frequence <= 0 || defi.enPause) {
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
        enregistrerEconomie(dateAjout, defi.montant, defi);
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

let defiEnEdition = null; // le défi en cours de modification (aucun au départ)

function creerFormulaireEdition(defi) {
  const ligne = document.createElement("li");
  ligne.className = "defi edition";
  ligne.innerHTML =
    '<label>Nom<input type="text" class="e-nom"></label>' +
    '<label>Montant (€)<input type="number" class="e-montant" step="0.01" min="0"></label>' +
    '<label>Ajout automatique tous les ... jours (0 = désactivé)' +
    '<input type="number" class="e-frequence" min="0" step="1"></label>' +
    '<div class="actions"></div>';

  ligne.querySelector(".e-nom").value = defi.nom;
  ligne.querySelector(".e-montant").value = defi.montant;
  ligne.querySelector(".e-frequence").value = defi.frequence;

  const boutonEnregistrer = document.createElement("button");
  boutonEnregistrer.textContent = "Enregistrer";
  boutonEnregistrer.className = "principal";
  boutonEnregistrer.addEventListener("click", function () {
    const nom = ligne.querySelector(".e-nom").value.trim();
    const montant = parseFloat(ligne.querySelector(".e-montant").value);
    const frequence = parseInt(ligne.querySelector(".e-frequence").value, 10);

    if (!nom || isNaN(montant) || montant < 0 || isNaN(frequence) || frequence < 0) {
      alert("Vérifie le nom, le montant et la fréquence.");
      return;
    }

    // Si la fréquence change, le calendrier repart d'aujourd'hui
    if (frequence !== defi.frequence) {
      defi.dateDebut = new Date().toISOString();
      defi.periodesCreditees = 0;
    }

    defi.nom = nom;
    defi.montant = montant;
    defi.frequence = frequence;
    defiEnEdition = null;
    sauvegarder();
    afficher();
  });

  const boutonAnnuler = document.createElement("button");
  boutonAnnuler.textContent = "Annuler";
  boutonAnnuler.addEventListener("click", function () {
    defiEnEdition = null;
    afficher();
  });

  const actions = ligne.querySelector(".actions");
  actions.appendChild(boutonEnregistrer);
  actions.appendChild(boutonAnnuler);
  return ligne;
}

// 5. Affichage des défis et du total
function afficherDefis() {
  liste.innerHTML = "";
  let totalGeneral = 0;

  defis.forEach(function (defi) {
    totalGeneral += defi.epargne;

    if (defi === defiEnEdition) {
      liste.appendChild(creerFormulaireEdition(defi));
      return;
    }

    const jourDuDefi = numeroJour(new Date()) - numeroJour(new Date(defi.dateCreation || defi.dateDebut)) + 1;
    let detail = formaterMontant(defi.montant) + " par dépense évitée\nJour " + jourDuDefi + " du défi";
    if (defi.modeles && defi.modeles.length > 1) {
      detail += "\nRegroupe : " + defi.modeles.join(", ");
    }
    if (defi.enPause) {
      detail += "\nEn pause : aucun ajout automatique";
    } else if (defi.frequence > 0) {
      detail += "\nAuto : tous les " + defi.frequence +
        " jour(s), prochain ajout le " + prochainAjout(defi);
    }

    const ligne = document.createElement("li");
    ligne.className = "defi" + (defi.enPause ? " pause" : "");
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
      ajouterDepenseEvitee(defi, defi.montant);
    });

    // Montant libre : un petit formulaire qui s'ouvre sous les boutons
    const boutonLibre = document.createElement("button");
    boutonLibre.textContent = "Autre montant";
    const formLibre = document.createElement("form");
    formLibre.className = "montant-libre";
    formLibre.hidden = true;
    formLibre.innerHTML =
      '<input type="number" step="0.01" min="0.01" placeholder="Montant évité (€)" required>' +
      '<button type="submit" class="principal">Ajouter</button>';
    boutonLibre.addEventListener("click", function () {
      formLibre.hidden = !formLibre.hidden;
      if (!formLibre.hidden) {
        formLibre.querySelector("input").focus();
      }
    });
    formLibre.addEventListener("submit", function (evenement) {
      evenement.preventDefault();
      const montant = parseFloat(formLibre.querySelector("input").value);
      if (montant > 0) {
        ajouterDepenseEvitee(defi, montant);
      }
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

    // Pause : à la reprise, le calendrier repart d'aujourd'hui
    const boutonPause = document.createElement("button");
    boutonPause.textContent = defi.enPause ? "Reprendre" : "Mettre en pause";
    boutonPause.addEventListener("click", function () {
      if (defi.enPause) {
        defi.dateCreation = defi.dateCreation || defi.dateDebut;
        defi.dateDebut = new Date().toISOString();
        defi.periodesCreditees = 0;
        defi.enPause = false;
      } else {
        defi.enPause = true;
      }
      sauvegarder();
      afficher();
    });

    const boutonModifier = document.createElement("button");
    boutonModifier.textContent = "Modifier";
    boutonModifier.addEventListener("click", function () {
      defiEnEdition = defi;
      afficher();
    });

    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.className = "supprimer";
    boutonSupprimer.addEventListener("click", function () {
      if (confirm("Supprimer le défi « " + defi.nom + " » ?")) {
        defis.splice(defis.indexOf(defi), 1);
        sauvegarder();
        afficher();
      }
    });

    actions.append(boutonEvite, boutonLibre, boutonRecuperer);
    if (defi.frequence > 0) {
      actions.append(boutonPause);
    }
    actions.append(boutonModifier, boutonSupprimer);
    ligne.append(actions, formLibre);
    liste.appendChild(ligne);
  });

  animerNombre(totalAffiche, totalGeneral);
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
  const styles = getComputedStyle(document.documentElement);
  const couleurTexte = styles.getPropertyValue("--discret").trim();
  const couleurGrille = styles.getPropertyValue("--trait").trim();
  const couleurCourbe = styles.getPropertyValue("--courbe").trim();
  const couleurZone = styles.getPropertyValue("--courbe-zone").trim();
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
  ctx.fillStyle = couleurTexte;

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
  ctx.strokeStyle = couleurGrille;
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
  ctx.strokeStyle = couleurCourbe;
  ctx.lineWidth = 2;
  ctx.stroke();

  // La zone colorée sous la courbe
  ctx.lineTo(posX(points.length - 1), posY(0));
  ctx.lineTo(posX(0), posY(0));
  ctx.closePath();
  ctx.fillStyle = couleurZone;
  ctx.fill();

  // Un point sur la dernière valeur
  ctx.beginPath();
  ctx.arc(
    posX(points.length - 1),
    posY(points[points.length - 1].valeur),
    4, 0, Math.PI * 2
  );
  ctx.fillStyle = couleurCourbe;
  ctx.fill();
}

function afficherTotalCumule() {
  let somme = 0;
  Object.keys(economiesParJour).forEach(function (cle) {
    somme += economiesParJour[cle];
  });
  totalCumuleAffiche.textContent = formaterMontant(arrondir(somme));
}

function afficherEpargneConcret() {

  let somme = 0;

  Object.keys(economiesParJour).forEach(function (cle) {
    somme += economiesParJour[cle];
  });

  somme = arrondir(somme);

  epargneConcretMontant.textContent =
    formaterMontant(somme);


  // ----------------------------------------------------------
  // Aucun montant économisé
  // ----------------------------------------------------------

  if (somme <= 0) {

    epargneConcretMessage.textContent =
      "Commence à économiser pour découvrir ce que ton épargne représente.";

    epargneConcretReferenceNom.textContent =
      "Ta première référence apparaîtra ici";

    epargneConcretReferenceValeur.textContent =
      "";

    epargneConcretProchainValeur.textContent =
      "—";

    epargneConcretProchainMessage.textContent =
      "";

    return;
  }


  // ----------------------------------------------------------
  // Référence la plus proche
  // ----------------------------------------------------------

  const reference =
    trouverReferenceProche(somme);

  if (reference) {

    const quantite =
      Math.floor(somme / reference.valeur);

    if (quantite >= 1) {

      epargneConcretMessage.textContent =
        "Cela représente environ " +
        quantite +
        " " +
        reference.nom +
        (quantite > 1 ? "s." : "") +
        ".";

    } else {

      epargneConcretMessage.textContent =
        "Tu te rapproches déjà de cette référence.";
    }


    epargneConcretReferenceNom.textContent =
      reference.nom;

    epargneConcretReferenceValeur.textContent =
      "Valeur indicative : " +
      formaterMontant(reference.valeur);
  }


  // ----------------------------------------------------------
  // Prochain palier
  // ----------------------------------------------------------

  const prochaine =
    trouverProchaineReference(somme);

  if (prochaine) {

    const reste =
      arrondir(prochaine.valeur - somme);

    epargneConcretProchainValeur.textContent =
      formaterMontant(prochaine.valeur);

    epargneConcretProchainMessage.textContent =
      "Encore " +
      formaterMontant(reste) +
      " pour atteindre environ " +
      prochaine.nom +
      ".";

  } else {

    epargneConcretProchainValeur.textContent =
      "Tu as dépassé toutes les références actuelles.";

    epargneConcretProchainMessage.textContent =
      "De nouvelles références pourront être ajoutées prochainement.";
  }
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
  afficherObjectifs();
  afficherTotalCumule();
  afficherEpargneConcret();
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
    id: "d" + Date.now(),
    economies: {},
    dateCreation: new Date().toISOString(),
    modeles: modelesChoisis.map(function (m) { return m.nom; }),
    frequence: parseInt(champFrequence.value, 10),
    dateDebut: new Date().toISOString(),
    periodesCreditees: 0
  });

  sauvegarder();
  afficher();
  formulaire.reset();
  dernierNomAuto = "";
  majModeles();
});

// Objectifs d'épargne
const formulaireObjectif = document.getElementById("formulaire-objectif");
const champNomObjectif = document.getElementById("nom-objectif");
const champCibleObjectif = document.getElementById("cible-objectif");
const listeObjectifs = document.getElementById("liste-objectifs");

// Total économisé depuis la création de l'objectif

const champDateObjectif = document.getElementById("date-objectif");
champDateObjectif.min = cleDate(new Date());

const MESSAGES = [
  ["Ton objectif est prêt : chaque dépense évitée te rapproche.", "Le plus dur est de commencer, et c'est fait.", "La première économie ne va pas tarder."],
  ["Bien parti ! Les petits montants font les grands totaux.", "Tu as démarré, c'est ce qui compte.", "Chaque pièce posée est une pièce gagnée."],
  ["Un quart du chemin : ça commence à se voir.", "Tu prends de l'élan, continue ainsi.", "Régulier, c'est exactement ce qu'il faut."],
  ["Tu as passé la moitié, le plus gros est derrière toi.", "La ligne d'arrivée se dessine.", "Belle constance, tu es au milieu du chemin."],
  ["Plus que quelques efforts, le but est en vue.", "Tu touches au but, ne lâche rien.", "Dernière ligne droite, tu y es presque."],
  ["Objectif atteint, bravo !", "Mission accomplie : tu l'as fait.", "Tu l'as mérité, profite-en."]
];

function progressionObjectif(objectif) {
  const depuis = cleDate(new Date(objectif.dateCreation));
  const ids = objectif.defisIds || [];
  let somme = 0;

  if (ids.length === 0) {
    Object.keys(economiesParJour).forEach(function (cle) {
      if (cle >= depuis) {
        somme += economiesParJour[cle];
      }
    });
  } else {
    defis.forEach(function (defi) {
      if (ids.includes(defi.id)) {
        Object.keys(defi.economies || {}).forEach(function (cle) {
          if (cle >= depuis) {
            somme += defi.economies[cle];
          }
        });
      }
    });
  }
  return arrondir(somme);
}

// Calcule le montant mensuel à viser pour tenir la date limite
function planObjectif(objectif, progression) {
  const reste = objectif.cible - progression;
  const fin = new Date(objectif.dateLimite + "T23:59:59");
  const joursRestants = Math.ceil((fin - new Date()) / 86400000);
  const dateTexte = fin.toLocaleDateString("fr-FR");

  if (joursRestants <= 0) {
    return "Date limite dépassée : il manque " + formaterMontant(reste) + ".";
  }
  const mois = joursRestants / 30.4375;
  if (mois < 1) {
    return "D'ici le " + dateTexte + " : " + formaterMontant(reste) + " à mettre de côté.";
  }

  const parMois = reste / mois;
  const jours = Math.max(1, numeroJour(new Date()) - numeroJour(new Date(objectif.dateCreation)) + 1);
  const rythme = (progression / jours) * 30.4375;
  let phrase = "Avant le " + dateTexte + " : environ " + formaterMontant(parMois) + " par mois.";
  phrase += rythme >= parMois
    ? " Tu es dans les temps."
    : " Ton rythme actuel : " + formaterMontant(rythme) + " par mois.";
  return phrase;
}

function afficherObjectifs() {
  listeObjectifs.innerHTML = "";

  objectifs.forEach(function (objectif, index) {
    objectif.defisIds = objectif.defisIds || [];
    if (objectif === objectifEnEdition) {
      listeObjectifs.appendChild(creerFormulaireObjectif(objectif));
      return;
    }
    const progression = progressionObjectif(objectif);
    const pourcentage = Math.min(100, Math.floor((progression / objectif.cible) * 100));
    const atteint = progression >= objectif.cible;

    // Le message change à chaque progression
    let anime = false;
    let ancienPourcentage = pourcentage;
    if (objectif.derniereProgression === undefined) {
      objectif.indexMessage = 0;
    } else if (progression > objectif.derniereProgression) {
      objectif.indexMessage = (objectif.indexMessage || 0) + 1;
      ancienPourcentage = Math.min(100, Math.floor((objectif.derniereProgression / objectif.cible) * 100));
      anime = true;
    }
    objectif.derniereProgression = progression;

    let tranche = 0;
    if (atteint) { tranche = 5; }
    else if (pourcentage >= 75) { tranche = 4; }
    else if (pourcentage >= 50) { tranche = 3; }
    else if (pourcentage >= 25) { tranche = 2; }
    else if (progression > 0) { tranche = 1; }
    const choix = MESSAGES[tranche];
    const message = choix[(objectif.indexMessage || 0) % choix.length];

    let details = formaterMontant(progression) + " sur " + formaterMontant(objectif.cible);
    if (!atteint && objectif.dateLimite) {
      details += "\n" + planObjectif(objectif, progression);
    }

    const ligne = document.createElement("li");
    ligne.className = "defi objectif" + (atteint ? " atteint" : "");
    ligne.innerHTML =
      '<div class="defi-tete"><strong></strong><span class="somme"></span></div>' +
      '<div class="barre"><div class="barre-remplie"></div></div>' +
      '<p class="message"></p><p class="detail"></p><div class="liens"></div>';
    ligne.querySelector("strong").textContent = objectif.nom;
    ligne.querySelector(".somme").textContent = pourcentage + " %";
    ligne.querySelector(".detail").innerText = details;

    const messageElement = ligne.querySelector(".message");
    messageElement.textContent = message;
    if (anime) {
      messageElement.classList.add("change");
    }

    // La barre se remplit en douceur
    const barre = ligne.querySelector(".barre-remplie");
    barre.style.width = ancienPourcentage + "%";
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        barre.style.width = pourcentage + "%";
      });
    });

    // Choix des défis qui alimentent cet objectif
    const liens = ligne.querySelector(".liens");
    if (defis.length > 0) {
      const titre = document.createElement("p");
      titre.className = "detail";
      titre.textContent = objectif.defisIds.length === 0
        ? "Défis associés : aucun coché, tout ce que tu économises compte."
        : "Défis associés :";
      liens.appendChild(titre);
    }
    defis.forEach(function (defi) {
      const etiquette = document.createElement("label");
      const caseCochee = document.createElement("input");
      caseCochee.type = "checkbox";
      caseCochee.checked = objectif.defisIds.includes(defi.id);
      caseCochee.addEventListener("change", function () {
        if (caseCochee.checked) {
          objectif.defisIds.push(defi.id);
        } else {
          objectif.defisIds = objectif.defisIds.filter(function (id) { return id !== defi.id; });
        }
        sauvegarder();
        afficher();
      });
      etiquette.appendChild(caseCochee);
      etiquette.appendChild(document.createTextNode(defi.nom));
      liens.appendChild(etiquette);
    });

    const actions = document.createElement("div");
    actions.className = "actions";
    const boutonSupprimer = document.createElement("button");
    boutonSupprimer.textContent = "Supprimer";
    boutonSupprimer.className = "supprimer";
    boutonSupprimer.addEventListener("click", function () {
      if (confirm("Supprimer l'objectif « " + objectif.nom + " » ?")) {
        objectifs.splice(index, 1);
        sauvegarder();
        afficher();
      }
    });
    const boutonModifierObjectif = document.createElement("button");
    boutonModifierObjectif.textContent = "Modifier";
    boutonModifierObjectif.addEventListener("click", function () {
      objectifEnEdition = objectif;
      afficher();
    });
    actions.appendChild(boutonModifierObjectif);
    actions.appendChild(boutonSupprimer);
    ligne.appendChild(actions);
    listeObjectifs.appendChild(ligne);
  });

  sauvegarder();
}

formulaireObjectif.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  objectifs.push({
    nom: champNomObjectif.value.trim(),
    cible: parseFloat(champCibleObjectif.value),
    dateCreation: new Date().toISOString(),
    dateLimite: champDateObjectif.value,
    defisIds: []
  });

  sauvegarder();
  afficher();
  formulaireObjectif.reset();
});

// Notification avec bouton Annuler
let minuteurNotification = null;

function afficherNotification(texte, actionAnnuler) {
  let boite = document.getElementById("notification");
  if (!boite) {
    boite = document.createElement("div");
    boite.id = "notification";
    document.body.appendChild(boite);
  }
  boite.innerHTML = "";

  const message = document.createElement("span");
  message.textContent = texte;
  boite.appendChild(message);

  if (actionAnnuler) {
    const bouton = document.createElement("button");
    bouton.textContent = "Annuler";
    bouton.addEventListener("click", function () {
      actionAnnuler();
      boite.classList.remove("visible");
    });
    boite.appendChild(bouton);
  }

  boite.classList.add("visible");
  clearTimeout(minuteurNotification);
  minuteurNotification = setTimeout(function () {
    boite.classList.remove("visible");
  }, 6000);
}

// Ajoute une dépense évitée (montant fixe ou libre), avec possibilité d'annuler
function ajouterDepenseEvitee(defi, montant) {
  const date = new Date();
  defi.epargne = arrondir(defi.epargne + montant);
  enregistrerEconomie(date, montant, defi);
  ajouterHistorique("evite", defi.nom, montant);
  const entree = historique[0];
  sauvegarder();
  afficher();

  afficherNotification(
    formaterMontant(montant) + " ajoutés à « " + defi.nom + " »",
    function () {
      if (!defis.includes(defi)) {
        return;
      }
      defi.epargne = arrondir(defi.epargne - montant);
      enregistrerEconomie(date, -montant, defi);
      historique = historique.filter(function (e) { return e !== entree; });
      archives = archives.filter(function (e) { return e !== entree; });
      sauvegarder();
      afficher();
    }
  );
}

// Modification d'un objectif
let objectifEnEdition = null;

function creerFormulaireObjectif(objectif) {
  const ligne = document.createElement("li");
  ligne.className = "defi edition";
  ligne.innerHTML =
    '<label>Nom<input type="text" class="e-nom"></label>' +
    '<label>Montant à atteindre (€)<input type="number" class="e-cible" step="0.01" min="1"></label>' +
    '<label>Date limite (facultatif)<input type="date" class="e-date"></label>' +
    '<div class="actions"></div>';
  ligne.querySelector(".e-nom").value = objectif.nom;
  ligne.querySelector(".e-cible").value = objectif.cible;
  ligne.querySelector(".e-date").value = objectif.dateLimite || "";

  const boutonEnregistrer = document.createElement("button");
  boutonEnregistrer.textContent = "Enregistrer";
  boutonEnregistrer.className = "principal";
  boutonEnregistrer.addEventListener("click", function () {
    const nom = ligne.querySelector(".e-nom").value.trim();
    const cible = parseFloat(ligne.querySelector(".e-cible").value);
    if (!nom || isNaN(cible) || cible <= 0) {
      alert("Vérifie le nom et le montant à atteindre.");
      return;
    }
    objectif.nom = nom;
    objectif.cible = cible;
    objectif.dateLimite = ligne.querySelector(".e-date").value;
    objectifEnEdition = null;
    sauvegarder();
    afficher();
  });

  const boutonAnnuler = document.createElement("button");
  boutonAnnuler.textContent = "Annuler";
  boutonAnnuler.addEventListener("click", function () {
    objectifEnEdition = null;
    afficher();
  });

  ligne.querySelector(".actions").append(boutonEnregistrer, boutonAnnuler);
  return ligne;
}

// ============================================================
// 9 bis. GESTION DE L'INTERFACE DES PROFILS
// ============================================================

const boutonProfil = document.getElementById("bouton-profil");
const nomProfil = document.getElementById("nom-profil");
const fenetreProfils = document.getElementById("fenetre-profils");
const fermerProfils = document.getElementById("fermer-profils");
const listeProfils = document.getElementById("liste-profils");
const formulaireProfil = document.getElementById("formulaire-profil");
const nomNouveauProfil = document.getElementById("nom-nouveau-profil");


// ------------------------------------------------------------
// Affichage du profil actif
// ------------------------------------------------------------

function afficherNomProfil() {
  const profil = EconomiesProfils.getActif();

  if (profil) {
    nomProfil.textContent = profil.nom;
  } else {
    nomProfil.textContent = "Mon profil";
  }
}


// ------------------------------------------------------------
// Affichage de la liste des profils
// ------------------------------------------------------------

function afficherListeProfils() {
  const profils = EconomiesProfils.lister();
  const profilActif = EconomiesProfils.getActif();

  listeProfils.innerHTML = "";

  Object.values(profils).forEach(function (profil) {

    const ligne = document.createElement("div");
    ligne.className = "profil-ligne";

    const informations = document.createElement("div");

    const nom = document.createElement("strong");
    nom.textContent = profil.nom;

    informations.appendChild(nom);

    if (
      profilActif &&
      profil.id === profilActif.id
    ) {
      const actif = document.createElement("span");
      actif.className = "profil-actif";
      actif.textContent = "Profil actif";
      informations.appendChild(actif);
    }

    const actions = document.createElement("div");
    actions.className = "actions";

    // Bouton de réinitialisation du profil actif
if (
  profilActif &&
  profil.id === profilActif.id
) {
  const boutonReinitialiser = document.createElement("button");
  boutonReinitialiser.textContent = "Réinitialiser";
  boutonReinitialiser.className = "supprimer";

  boutonReinitialiser.addEventListener("click", function () {
    afficherConfirmationReinitialisation(profil);
  });

  actions.appendChild(boutonReinitialiser);
}

    // Bouton pour changer de profil
    if (
      !profilActif ||
      profil.id !== profilActif.id
    ) {
      const boutonChoisir = document.createElement("button");
      boutonChoisir.textContent = "Choisir";
      boutonChoisir.className = "principal";

      boutonChoisir.addEventListener("click", function () {
        EconomiesProfils.changer(profil.id);
      });

      actions.appendChild(boutonChoisir);
    }

    // Bouton supprimer
    const tousLesProfils = Object.keys(profils);

    if (tousLesProfils.length > 1) {
      const boutonSupprimer = document.createElement("button");
      boutonSupprimer.textContent = "Supprimer";
      boutonSupprimer.className = "supprimer";

      boutonSupprimer.addEventListener("click", function () {
        EconomiesProfils.supprimer(profil.id);
      });

      actions.appendChild(boutonSupprimer);
    }

    ligne.appendChild(informations);
    ligne.appendChild(actions);

    listeProfils.appendChild(ligne);
  });
}


// ------------------------------------------------------------
// Ouverture de la fenêtre
// ------------------------------------------------------------

boutonProfil.addEventListener("click", function () {
  afficherNomProfil();
  afficherListeProfils();

  fenetreProfils.hidden = false;
});


// ------------------------------------------------------------
// Fermeture de la fenêtre
// ------------------------------------------------------------

fermerProfils.addEventListener("click", function () {
  fenetreProfils.hidden = true;
});


// ------------------------------------------------------------
// Création d'un nouveau profil
// ------------------------------------------------------------

formulaireProfil.addEventListener("submit", function (evenement) {
  evenement.preventDefault();

  const nom = nomNouveauProfil.value.trim();

  if (!nom) {
    return;
  }

  const profil = EconomiesProfils.creer(nom);

  if (!profil) {
    return;
  }

  /*
   * creerProfil() rend automatiquement le nouveau profil actif.
   * On recharge donc l'application pour charger ses données vierges.
   */
  window.location.reload();
});

// ============================================================
// POPUP DE CONFIRMATION DE RÉINITIALISATION
// ============================================================

function afficherConfirmationReinitialisation(profil) {

  const fond = document.createElement("div");
  fond.className = "popup-confirmation";

  const panneau = document.createElement("div");
  panneau.className = "popup-confirmation-panneau";

  const titre = document.createElement("h2");
  titre.textContent = "Réinitialiser le profil ?";

  const message = document.createElement("p");
  message.textContent =
    "Toutes les données du profil « " +
    profil.nom +
    " » seront supprimées : défis, objectifs, historique, archives et économies.";

  const avertissement = document.createElement("p");
  avertissement.className = "popup-avertissement";
  avertissement.textContent =
    "Cette action est définitive.";

  const actions = document.createElement("div");
  actions.className = "popup-actions";

  const boutonAnnuler = document.createElement("button");
  boutonAnnuler.textContent = "Annuler";

  const boutonConfirmer = document.createElement("button");
  boutonConfirmer.textContent = "Réinitialiser";
  boutonConfirmer.className = "supprimer";

  boutonAnnuler.addEventListener("click", function () {
    fond.remove();
  });

  boutonConfirmer.addEventListener("click", function () {

    const reussi =
      EconomiesProfils.reinitialiser(profil.id);

    if (!reussi) {
      fond.remove();
      return;
    }

    /*
     * Le profil reste le même.
     * Seules ses données ont été vidées.
     * On recharge l'application pour repartir proprement.
     */
    window.location.reload();
  });

  actions.appendChild(boutonAnnuler);
  actions.appendChild(boutonConfirmer);

  panneau.appendChild(titre);
  panneau.appendChild(message);
  panneau.appendChild(avertissement);
  panneau.appendChild(actions);

  fond.appendChild(panneau);
  document.body.appendChild(fond);
}

// 10. Démarrage
// Modèles de défis (montants moyens indicatifs, à ajuster)

const MODELES = [
  { groupe: "Tabac et addictions", nom: "Paquet de cigarettes", montant: 12.5, frequence: 1 },
  { groupe: "Tabac et addictions", nom: "Pochette de tabac à rouler", montant: 14, frequence: 3 },
  { groupe: "Tabac et addictions", nom: "Recharges de cigarette électronique", montant: 10, frequence: 5 },
  { groupe: "Tabac et addictions", nom: "Verre ou cocktail au bar", montant: 7, frequence: 3 },
  { groupe: "Tabac et addictions", nom: "Bouteille de vin ou d'alcool", montant: 9, frequence: 3 },
  { groupe: "Tabac et addictions", nom: "Paris sportifs et jeux à gratter", montant: 10, frequence: 3 },

  { groupe: "Repas et boissons", nom: "Livraison de repas", montant: 22, frequence: 7 },
  { groupe: "Repas et boissons", nom: "Fast-food", montant: 12, frequence: 4 },
  { groupe: "Repas et boissons", nom: "Pizza ou kebab à emporter", montant: 14, frequence: 7 },
  { groupe: "Repas et boissons", nom: "Restaurant", montant: 35, frequence: 14 },
  { groupe: "Repas et boissons", nom: "Café à emporter", montant: 3.5, frequence: 1 },
  { groupe: "Repas et boissons", nom: "Sandwich ou viennoiserie du midi", montant: 6, frequence: 1 },
  { groupe: "Repas et boissons", nom: "Boisson sucrée ou énergisante", montant: 2.5, frequence: 1 },
  { groupe: "Repas et boissons", nom: "Snacks, confiseries et distributeur", montant: 3, frequence: 1 },

  { groupe: "Achats et loisirs", nom: "Achat impulsif en ligne", montant: 20, frequence: 7 },
  { groupe: "Achats et loisirs", nom: "Vêtements fast-fashion", montant: 30, frequence: 14 },
  { groupe: "Achats et loisirs", nom: "Abonnement peu utilisé (streaming, appli)", montant: 12, frequence: 30 },
  { groupe: "Achats et loisirs", nom: "Achats dans les jeux vidéo et applis", montant: 10, frequence: 7 },
  { groupe: "Achats et loisirs", nom: "Sortie ou soirée", montant: 35, frequence: 14 },
  { groupe: "Achats et loisirs", nom: "Taxi ou VTC pour un petit trajet", montant: 12, frequence: 7 },
  { groupe: "Achats et loisirs", nom: "Gadgets et petite décoration", montant: 15, frequence: 14 },

  { groupe: "Animal de compagnie", nom: "Croquettes ou pâtée", montant: 30, frequence: 30 },
  { groupe: "Animal de compagnie", nom: "Provision pour le vétérinaire", montant: 20, frequence: 30 },
  { groupe: "Animal de compagnie", nom: "Friandises, jouets et accessoires", montant: 10, frequence: 15 },
  { groupe: "Animal de compagnie", nom: "Toilettage ou pension", montant: 40, frequence: 60 },

  { groupe: "Mise de côté libre", nom: "Petite pièce du jour", montant: 2, frequence: 1 },
  { groupe: "Mise de côté libre", nom: "Mise de côté du week-end", montant: 10, frequence: 7 }
];

const listeModeles = document.getElementById("liste-modeles");
const resumeModeles = document.getElementById("resume-modeles");
const recapModeles = document.getElementById("recap-modeles");
let modelesChoisis = [];
let dernierNomAuto = "";

function rythmeTexte(frequence) {
  if (frequence === 1) { return "par jour"; }
  if (frequence === 7) { return "par semaine"; }
  if (frequence === 30) { return "par mois"; }
  return "tous les " + frequence + " jours";
}

// Menu déroulant : une case à cocher par modèle, rangés par famille
let groupeActuel = "";
MODELES.forEach(function (modele, i) {
  if (modele.groupe !== groupeActuel) {
    groupeActuel = modele.groupe;
    const titre = document.createElement("p");
    titre.className = "groupe";
    titre.textContent = groupeActuel;
    listeModeles.appendChild(titre);
  }
  const etiquette = document.createElement("label");
  const caseCochee = document.createElement("input");
  caseCochee.type = "checkbox";
  caseCochee.value = i;
  caseCochee.addEventListener("change", majModeles);
  etiquette.appendChild(caseCochee);
  etiquette.appendChild(document.createTextNode(
    modele.nom + " : " + formaterMontant(modele.montant) + " " + rythmeTexte(modele.frequence)
  ));
  listeModeles.appendChild(etiquette);
});

// Met à jour le récapitulatif et remplit le formulaire
function majModeles() {
  const cochees = Array.from(listeModeles.querySelectorAll("input:checked"));
  modelesChoisis = cochees.map(function (c) { return MODELES[Number(c.value)]; });
  recapModeles.innerHTML = "";

  if (modelesChoisis.length === 0) {
    resumeModeles.textContent = "Choisir des modèles (facultatif)";
    return;
  }
  resumeModeles.textContent = modelesChoisis.length + " modèle(s) sélectionné(s)";

  let parJour = 0;
  modelesChoisis.forEach(function (modele) {
    parJour += modele.montant / modele.frequence;
    const ligne = document.createElement("li");
    ligne.textContent =
      modele.nom + " : " + formaterMontant(modele.montant) + " " + rythmeTexte(modele.frequence);
    recapModeles.appendChild(ligne);
  });

  let montant = modelesChoisis[0].montant;
  let frequence = modelesChoisis[0].frequence;
  if (modelesChoisis.length > 1) {
    montant = arrondir(parJour);
    frequence = 1;
    const total = document.createElement("li");
    total.className = "total";
    total.textContent = "Total regroupé : " + formaterMontant(montant) + " par jour";
    recapModeles.appendChild(total);
  }

  const nomAuto = modelesChoisis.map(function (m) { return m.nom; }).join(" + ");
  if (champNom.value === "" || champNom.value === dernierNomAuto) {
    champNom.value = nomAuto;
  }
  dernierNomAuto = nomAuto;
  champMontant.value = montant;
  champFrequence.value = frequence;
}

afficherNomProfil();
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

// Total qui s'incrémente en douceur
function animerNombre(element, cible) {
  const depart = Number(element.dataset.valeur || 0);
  element.dataset.valeur = cible;
  const debut = performance.now();

  function pas(maintenant) {
    const t = Math.min(1, (maintenant - debut) / 700);
    const valeur = depart + (cible - depart) * (1 - Math.pow(1 - t, 3));
    element.textContent = valeur.toFixed(2).replace(".", ",");
    if (t < 1) {
      requestAnimationFrame(pas);
    }
  }
  requestAnimationFrame(pas);
}

// Mode sombre
const boutonTheme = document.getElementById("bouton-theme");

function appliquerTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("theme", theme);
  boutonTheme.textContent = theme === "dark" ? "Mode clair" : "Mode sombre";
  dessinerGraphique();
}

appliquerTheme(document.documentElement.getAttribute("data-theme"));
boutonTheme.addEventListener("click", function () {
  const actuel = document.documentElement.getAttribute("data-theme");
  appliquerTheme(actuel === "dark" ? "light" : "dark");
});

// Animation d'apparition des cartes, uniquement au chargement
document.body.classList.add("charge");
setTimeout(function () { document.body.classList.remove("charge"); }, 1500);

// Astuces et citations, toutes les 6 secondes
const ASTUCES = [
  { texte: "Mets de côté dès que tu évites une dépense, pas en fin de mois : l'argent que tu vois, tu le gardes.", auteur: "Astuce" },
  { texte: "Ne mets pas de côté ce qui reste après avoir dépensé : dépense ce qui reste après avoir mis de côté.", auteur: "Warren Buffett (citation attribuée)" },
  { texte: "Une petite somme chaque jour pèse plus qu'un gros effort rare.", auteur: "Astuce" },
  { texte: "Attends 48 heures avant un achat non prévu : l'envie retombe souvent d'elle-même.", auteur: "Astuce" },
  { texte: "Prends garde aux petites dépenses : une petite fuite peut couler un grand navire.", auteur: "Benjamin Franklin" },
  { texte: "Vérifie tes abonnements chaque trimestre : certains ne servent plus.", auteur: "Astuce" },
  { texte: "Une habitude coûteuse arrêtée rapporte chaque jour : multiplie son prix par 365 pour voir l'effet.", auteur: "Astuce" },
  { texte: "Un objectif précis avec une date motive bien plus qu'un vague « économiser ».", auteur: "Astuce" },
  { texte: "Cuisiner à l'avance évite la plupart des livraisons de dernière minute.", auteur: "Astuce" },
  { texte: "Fête chaque palier atteint par un petit plaisir gratuit : la motivation aime les récompenses.", auteur: "Astuce" },
  { texte: "Note la dépense évitée dès que l'envie est passée : ce geste renforce l'habitude.", auteur: "Astuce" }
];

const blocAstuce = document.getElementById("astuce");
const texteAstuce = document.getElementById("astuce-texte");
const auteurAstuce = document.getElementById("astuce-auteur");
let indexAstuce = Math.floor(Math.random() * ASTUCES.length);

function montrerAstuce() {
  blocAstuce.classList.add("sortie");
  setTimeout(function () {
    const astuce = ASTUCES[indexAstuce];
    texteAstuce.textContent = astuce.texte;
    auteurAstuce.textContent = astuce.auteur;
    indexAstuce = (indexAstuce + 1) % ASTUCES.length;
    blocAstuce.classList.remove("sortie");
  }, 450);
}

montrerAstuce();
setInterval(montrerAstuce, 9000);

