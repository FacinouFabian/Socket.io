importScripts(
    "./precache-manifest.608b6e5898a3d02d93091ae675a11075.js"
);

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
  
workbox.core.clientsClaim();

self.__precacheManifest = [].concat(self.__precacheManifest || []);
workbox.precaching.precacheAndRoute(self.__precacheManifest, {});

self.addEventListener('install', event => {
    console.log('install')
})

self.addEventListener('activate', event => {
    console.log('activate')
})

console.log("Hello Worlds");