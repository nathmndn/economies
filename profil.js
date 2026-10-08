// Gestion des profils locaux

const CLE_PROFILS = "economies_profils";
const CLE_PROFIL_ACTIF = "economies_profil_actif";

const ANCIENNES_CLES = [
  "defis",
  "historique",
  "archives",
  "economiesParJour",
  "objectifs"
];

const DONNEES_VIDES = {
  defis: [],
  historique: [],
  archives: [],
  economiesParJour: {},
  objectifs: []
};

function lireProfils() {
  try {
    return JSON.parse(localStorage.getItem(CLE_PROFILS)) || {};
  } catch (erreur) {
    console.error("Impossible de lire les profils :", erreur);
    return {};
  }
}

function enregistrerProfils(profils) {
  localStorage.setItem(CLE_PROFILS, JSON.stringify(profils));
}

function lireProfilActif() {
  return localStorage.getItem(CLE_PROFIL_ACTIF);
}

function definirProfilActif(id) {
  localStorage.setItem(CLE_PROFIL_ACTIF, id);
}

function creerIdProfil() {
  return "p" + Date.now() + Math.random().toString(36).slice(2, 8);
}

function creerProfil(nom) {
  const profils = lireProfils();

  const id = creerIdProfil();

  profils[id] = {
    id: id,
    nom: nom.trim(),
    dateCreation: new Date().toISOString(),
    donnees: JSON.parse(JSON.stringify(DONNEES_VIDES))
  };

  enregistrerProfils(profils);
  definirProfilActif(id);

  return profils[id];
}

function supprimerProfil(id) {
  const profils = lireProfils();

  delete profils[id];

  enregistrerProfils(profils);

  const ids = Object.keys(profils);

  if (ids.length > 0) {
    definirProfilActif(ids[0]);
  } else {
    localStorage.removeItem(CLE_PROFIL_ACTIF);
  }
}

function getProfilActif() {
  const profils = lireProfils();
  const id = lireProfilActif();

  if (id && profils[id]) {
    return profils[id];
  }

  const ids = Object.keys(profils);

  if (ids.length === 0) {
    return null;
  }

  definirProfilActif(ids[0]);
  return profils[ids[0]];
}

// Migration des anciennes données
function migrerAnciennesDonnees() {
  const profils = lireProfils();

  // Des profils existent déjà : aucune migration nécessaire
  if (Object.keys(profils).length > 0) {
    return;
  }

  let anciennesDonnees = {};
  let trouve = false;

  ANCIENNES_CLES.forEach(function (cle) {
    const valeur = localStorage.getItem(cle);

    if (valeur !== null) {
      try {
        anciennesDonnees[cle] = JSON.parse(valeur);
        trouve = true;
      } catch (erreur) {
        console.warn("Donnée impossible à migrer :", cle);
      }
    }
  });

  if (!trouve) {
    return;
  }

  const profil = creerProfil("Mon profil");

  profil.donnees = {
    defis: anciennesDonnees.defis || [],
    historique: anciennesDonnees.historique || [],
    archives: anciennesDonnees.archives || [],
    economiesParJour: anciennesDonnees.economiesParJour || {},
    objectifs: anciennesDonnees.objectifs || []
  };

  const nouveauxProfils = lireProfils();
  nouveauxProfils[profil.id] = profil;

  enregistrerProfils(nouveauxProfils);

  // Les anciennes clés ne sont plus nécessaires.
  ANCIENNES_CLES.forEach(function (cle) {
    localStorage.removeItem(cle);
  });
}

migrerAnciennesDonnees();