// Minimal service worker — required for PWA installability / share target.
// Network-first passthrough; no aggressive caching so the SPA always gets
// fresh assets. (Add a caching strategy later if you want offline support.)
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => { /* default network behaviour */ });
