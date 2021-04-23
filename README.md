# a service-worker svelte-kit vite plugin to work with workbox

# installation

`npm i -D kit-sw-workbox`

# Usage

```js
// svelte.config.cjs
const sw=require('kit-sw-workbox')

module.exports = {
    ...
    ...
	kit: {
        ...
        ...
		vite: {
			plugins: [
                sw({routes: []})
            ],
        ...
        ...
	}
};
```

> by default it is going to cache all the static files and build files except the routes

> routes: are the routes which you would like to be cached too
> eg:

```js
sw{routes: ['/','/about',...]}
```

### now in

```js
// src/service-worker.ts/js

// @ts-ignore
import { build, files } from '$service-worker';

import { precacheAndRoute } from 'workbox-precaching';

// // @ts-ignore
precacheAndRoute([...build, ...files]);

// this is require if you would like to create a prompt on so every time a new build is available
// it will show you the prompt in order activate it and skip waiting
// something like new update
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    // @ts-ignore
    self.skipWaiting();
  }
});
```

in

```js
//  src/routes/$layout.svelte

import { dev, browser } from '$app/env';

	const base_url = store.state.base_url;
	if (!dev && browser) {
		(async () => {
			if ('serviceWorker' in navigator) {
				const { Workbox, messageSW } = await import('workbox-window');
				const sw_url = base_url + 'service-worker.js';
				const wb = new Workbox(sw_url);
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

                        // since the user accepted the prompt we should skip_waiting
                        if (registration?.waiting) {
                            messageSW(registration.waiting, { type: 'SKIP_WAITING' });
                        }
					});
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

### Also you might want to install these

```
npm i -D workbox-window
npm i -D workbox-precaching
```

### need any help you can open an issue
# kit-sw-workbox
