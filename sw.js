const NOM_CACHE = "economies-v1";
const FICHIERS = [
  "./",
  "index.html",
  "style.css",
  "app.js",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png"
];

// À l'installation : on garde une copie des fichiers
self.addEventListener("install", function (evenement) {
  evenement.waitUntil(
    caches.open(NOM_CACHE).then(function (cache) {
      return cache.addAll(FICHIERS);
    })
  );
  self.skipWaiting();
});

// À l'activation : on supprime les anciennes copies
self.addEventListener("activate", function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(
        noms
          .filter(function (nom) { return nom !== NOM_CACHE; })
          .map(function (nom) { return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

// À chaque demande : on essaie internet d'abord (pour avoir la dernière
// version), et on utilise la copie si on est hors connexion
self.addEventListener("fetch", function (evenement) {
  if (evenement.request.method !== "GET") {
    return;
  }
  if (new URL(evenement.request.url).origin !== location.origin) {
    return;
  }

  evenement.respondWith(
    fetch(evenement.request)
      .then(function (reponse) {
        const copie = reponse.clone();
        caches.open(NOM_CACHE).then(function (cache) {
          cache.put(evenement.request, copie);
        });
        return reponse;
      })
      .catch(function () {
        return caches.match(evenement.request).then(function (trouve) {
          return trouve || caches.match("index.html");
        });
      })
  );
});