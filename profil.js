// ============================================================
// GESTION DES PROFILS LOCAUX
// ============================================================

const CLE_PROFILS = "economies_profils";
const CLE_PROFIL_ACTIF = "economies_profil_actif";

const CLES_DONNEES = [
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
  economiesParJour: null,
  objectifs: []
};


// ============================================================
// OUTILS DE BASE
// ============================================================

function lireProfils() {
  try {
    return JSON.parse(
      localStorage.getItem(CLE_PROFILS)
    ) || {};
  } catch (erreur) {
    console.error(
      "Impossible de lire les profils :",
      erreur
    );

    return {};
  }
}


function enregistrerProfils(profils) {
  localStorage.setItem(
    CLE_PROFILS,
    JSON.stringify(profils)
  );
}


function lireProfilActif() {
  return localStorage.getItem(
    CLE_PROFIL_ACTIF
  );
}


function definirProfilActif(id) {
  localStorage.setItem(
    CLE_PROFIL_ACTIF,
    id
  );
}


function creerIdProfil() {
  return (
    "p" +
    Date.now() +
    Math.random()
      .toString(36)
      .slice(2, 8)
  );
}


function copierDonnees(donnees) {
  return JSON.parse(
    JSON.stringify(donnees)
  );
}


// ============================================================
// PROFIL ACTIF
// ============================================================

function getProfilActif() {

  const profils =
    lireProfils();

  let id =
    lireProfilActif();

  /*
   * Si le profil enregistré n'existe plus,
   * on prend le premier profil disponible.
   */

  if (
    !id ||
    !profils[id]
  ) {

    const ids =
      Object.keys(profils);

    if (ids.length === 0) {
      return null;
    }

    id = ids[0];

    definirProfilActif(id);
  }

  return profils[id];
}


// ============================================================
// CRÉATION
// ============================================================

function creerProfil(nom) {

  nom =
    String(nom || "")
      .trim();

  if (!nom) {
    return null;
  }

  const profils =
    lireProfils();

  const id =
    creerIdProfil();

  const profil = {
    id: id,

    nom: nom,

    dateCreation:
      new Date().toISOString(),

    donnees:
      copierDonnees(
        DONNEES_VIDES
      )
  };

  profils[id] =
    profil;

  enregistrerProfils(
    profils
  );

  definirProfilActif(
    id
  );

  return profil;
}


// ============================================================
// SAUVEGARDE DES DONNÉES DU PROFIL
// ============================================================

function sauvegarderDonneesProfil(
  donnees
) {

  const profil =
    getProfilActif();

  if (!profil) {
    return false;
  }

  const profils =
    lireProfils();

  /*
   * On remplace uniquement les données,
   * pas les informations du profil.
   */

  profils[profil.id].donnees = {
    defis:
      donnees.defis || [],

    historique:
      donnees.historique || [],

    archives:
      donnees.archives || [],

    economiesParJour:
      donnees.economiesParJour ?? null,

    objectifs:
      donnees.objectifs || []
  };

  enregistrerProfils(
    profils
  );

  return true;
}


// ============================================================
// RÉCUPÉRATION DES DONNÉES
// ============================================================

function chargerDonneesProfil() {

  const profil =
    getProfilActif();

  if (!profil) {

    return copierDonnees(
      DONNEES_VIDES
    );

  }

  return Object.assign(
    copierDonnees(
      DONNEES_VIDES
    ),
    profil.donnees || {}
  );
}


// ============================================================
// CHANGEMENT DE PROFIL
// ============================================================

function changerProfil(id) {

  const profils =
    lireProfils();

  if (!profils[id]) {
    return false;
  }

  definirProfilActif(
    id
  );

  /*
   * Recharge l'application afin que toutes les variables
   * de app.js soient recréées avec les nouvelles données.
   */

  window.location.reload();

  return true;
}


// ============================================================
// SUPPRESSION
// ============================================================

function supprimerProfil(id) {

  const profils =
    lireProfils();

  if (!profils[id]) {
    return false;
  }

  const ids =
    Object.keys(profils);

  if (ids.length <= 1) {

    alert(
      "Tu dois conserver au moins un profil."
    );

    return false;
  }

  const profil =
    profils[id];

  const confirmation =
    confirm(
      "Supprimer définitivement le profil « " +
      profil.nom +
      " » et toutes ses données ?"
    );

  if (!confirmation) {
    return false;
  }

  delete profils[id];

  let profilActif =
    lireProfilActif();

  if (
    profilActif === id
  ) {

    profilActif =
      Object.keys(profils)[0];

    definirProfilActif(
      profilActif
    );
  }

  enregistrerProfils(
    profils
  );

  window.location.reload();

  return true;
}


// ============================================================
// MIGRATION DES ANCIENNES DONNÉES
// ============================================================

function migrerAnciennesDonnees() {

  const profils =
    lireProfils();

  /*
   * Si des profils existent déjà,
   * surtout ne rien migrer.
   */

  if (
    Object.keys(profils).length > 0
  ) {
    return;
  }

  const anciennesDonnees = {};

  let trouve =
    false;

  CLES_DONNEES.forEach(
    function (cle) {

      const valeur =
        localStorage.getItem(
          cle
        );

      if (
        valeur !== null
      ) {

        try {

          anciennesDonnees[cle] =
            JSON.parse(valeur);

          trouve =
            true;

        } catch (erreur) {

          console.warn(
            "Impossible de migrer :",
            cle,
            erreur
          );

        }
      }

    }
  );


  /*
   * Même sur une installation neuve,
   * on crée un profil par défaut.
   */

  const profil =
    creerProfil(
      "Mon profil"
    );

  if (!profil) {
    return;
  }


  /*
   * Si d'anciennes données existaient,
   * on les récupère.
   */

  if (trouve) {

    const profils =
      lireProfils();

    profils[profil.id].donnees = {

      defis:
        anciennesDonnees.defis ||
        [],

      historique:
        anciennesDonnees.historique ||
        [],

      archives:
        anciennesDonnees.archives ||
        [],

      economiesParJour:
        anciennesDonnees.economiesParJour ??
        null,

      objectifs:
        anciennesDonnees.objectifs ||
        []

    };

    enregistrerProfils(
      profils
    );


    /*
     * Les anciennes clés ne servent plus.
     */

    CLES_DONNEES.forEach(
      function (cle) {

        localStorage.removeItem(
          cle
        );

      }
    );
  }
}


// ============================================================
// INTERFACE PUBLIQUE
// ============================================================

window.EconomiesProfils = {

  getActif:
    getProfilActif,

  charger:
    chargerDonneesProfil,

  sauvegarder:
    sauvegarderDonneesProfil,

  creer:
    creerProfil,

  changer:
    changerProfil,

  supprimer:
    supprimerProfil,

  lister:
    lireProfils

};


// ============================================================
// INITIALISATION
// ============================================================

migrerAnciennesDonnees();