A service-worker svelte-kit vite plugin to use with workbox

# Installation

`npm i -D kit-sw-workbox`

# Usage

```js
// svelte.config.cjs
const sw=require('kit-sw-workbox')

module.exports = {
    ...
	kit: {
        ...
	   vite: {
	      plugins: [
	         sw({routes: []})
	      ],
           ...
	   }
};
```

> By default it is going to cache all the static files and build files except the routes

> Routes: are the routes which you would like to be cached too
> Example:
```js
sw({routes: ['/','/about',...]})
```

## Example service-worker file
[Workbox module import statements and importScripts](https://developers.google.com/web/tools/workbox/modules/workbox-sw#convert_code_using_import_statements_to_use_workbox-sw)

### Usings module imports

Install the modules you need

`npm i -D workbox-precaching`

```js
// src/service-worker.ts/js

import { build, files } from '$service-worker';

import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute([...build, ...files]);

// this is required if you would like to create a prompt or so
// a SKIP_WAITING message is sent from browser window
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
``` 

### Using  importScripts with `workbox-sw`
```js
import { build, files, timestamp } from '$service-worker';

importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.2.0/workbox-sw.js');


// debuging is false by default
workbox.setConfig({
	debug: true
});

// load module you want to use
workbox.loadModule('workbox-precaching');


workbox.precaching.precacheAndRoute([...build, ...files]);
```

## Example in your browser window code
Using `workbox-window`
```
npm i -D workbox-window
```

```js
//  src/routes/__layout.svelte

import { dev, browser } from '$app/env';

if (!dev && browser) {
  (async () => {
    if ('serviceWorker' in navigator) {
      const { Workbox, messageSW } = await import('workbox-window');
      const wb = new Workbox('/service-worker.js');
      let registration;

      // this will always activate the new build on available

      // if you want you can show a prompt to user instead
      // whether they wish to actiavte now and restart the page
      // thereby losing their current webapp state
      // or they want restart later
      const skipWaiting = (event) => {
        // fires when the waiting service worker becomes active
        wb.addEventListener('controlling', (event) => {
          window.location.reload();
        });
	// some logic to allow user to SKIP_WAITING
        // if the user accepted we skip_waiting
        if (registration?.waiting) {
          messageSW(registration.waiting, { type: 'SKIP_WAITING' });
        }
      };

      // fires when service worker has installed but is waiting to activate.
      wb.addEventListener('waiting', skipWaiting);
      //   @ts-ignore
      wb.addEventListener('externalwaiting', skipWaiting);

      wb.register().then((r) => (registration = r));
    }
  })();
}
```

### Need any help you can open an issue

# kit-sw-workbox
