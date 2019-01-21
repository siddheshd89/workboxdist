/*
Copyright 2018 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js');

if (workbox) {
  console.log(`Yay! Workbox is loaded 🎉`);

  workbox.precaching.precacheAndRoute([
  {
    "url": "style/main.css",
    "revision": "06c2837bfdab7b6d6f03fa4d697d74c8"
  },
  {
    "url": "index.html",
    "revision": "f760df0ce33c72994537e90eb73f45b2"
  },
  {
    "url": "js/idb-promised.js",
    "revision": "8fb5c9b2f422347fb1a54827f2ff40a6"
  },
  {
    "url": "js/main.js",
    "revision": "cd18ab7a2f7b8437bdea3bb087146de0"
  },
  {
    "url": "images/profile/cat.jpg",
    "revision": "69936d25849a358d314f2f82e9fa4578"
  },
  {
    "url": "images/touch/icon-128x128.png",
    "revision": "c2c8e1400d6126ea32eaac29009733a9"
  },
  {
    "url": "images/touch/icon-192x192.png",
    "revision": "571f134f59f14a6d298ddd66c015b293"
  },
  {
    "url": "images/touch/icon-256x256.png",
    "revision": "848055c2f5d42b0c405cff37739261e9"
  },
  {
    "url": "images/touch/icon-384X384.png",
    "revision": "a1be08eac51e8ff734a337b90ddc1c16"
  },
  {
    "url": "images/touch/icon-512x512.png",
    "revision": "b3d7c4eaefdd3d30e348a56d8048bf68"
  },
  {
    "url": "manifest.json",
    "revision": "cdc5ec9345c98f2a63d1513acdca4202"
  }
]);
 /* const bgSyncPlugin = new workbox.backgroundSync.Plugin('dashboardr-queue',{
	  maxRetentionTime: 24 * 60 // Retry for max of 24 Hours
  });*/
  const showNotification = () => {
	  self.registration.showNotification('Background sync success!', {
	    body: '🎉`🎉`🎉`'
	  });
	};

  const bgSyncPlugin = new workbox.backgroundSync.Plugin(
		  'dashboardr-queue',
		  {
		    callbacks: {
		      queueDidReplay: showNotification
		      // other types of callbacks could go here
		    }
		  }
		);
  const networkWithBackgroundSync = new workbox.strategies.NetworkOnly({
	  plugins: [bgSyncPlugin],
	});

	workbox.routing.registerRoute(
	  /\/api\/*/,
	  networkWithBackgroundSync,
	  'POST'
	);

  /*const networkWithBackgroundSync = new workbox.strategies.NetworkOnly({
    plugins: [bgSyncPlugin],
  });*/

  /*workbox.routing.registerRoute(
    /\/api\/add/,
    workbox.strategies.NetworkOnly({
        plugins: [bgSyncPlugin],
      }),
    'POST'
  );*/
  /*self.addEventListener('fetch', (event) => {
	  // Clone the request to ensure it's save to read when
	  // adding to the Queue.
	  const promiseChain = fetch(event.request.clone())
	  .catch((err) => {
	      return queue.addRequest(event.request);
	  });

	  event.waitUntil(promiseChain);
	});*/
} else {
  console.log(`Boo! Workbox didn't load 😬`);
}
