// SIAPASN Service Worker Cleaner
// Automatically responds 200 OK and unregisters any obsolete service workers previously cached on this origin (e.g. localhost)

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration.unregister().then(() => {
      return self.clients.matchAll();
    }).then((clients) => {
      clients.forEach((client) => {
        if (client.navigate) {
          // client notified
        }
      });
    })
  );
});
