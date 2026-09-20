# Offline architecture

Adapted from ../low-poly-fire-truck. Root deployment only. Production registration is non-blocking.

## Build contract

`public/sw.js` is a template, not a deployable worker. The build must replace the quoted string `'__BUILD_ID__'` with a deterministic content hash string and the quoted string `'__PRECACHE_URLS__'` with a JSON array of absolute URL paths. Hash actual bytes, including worker source, HTML, bundles, manifest and icons: size alone cannot detect changes. The precache must contain `/index.html`, `/offline.html`, `/manifest.webmanifest`, `/icons/icon-192.png`, `/icons/icon-512.png`, `/icons/apple-touch-icon.png`, and every emitted `/assets/` bundle. New game assets must enter this manifest before offline readiness can cover them. Do not include generated design concepts or evidence in the runtime precache.

The worker rejects an unstamped template. Installation fetches every required file successfully before activation; an interrupted install leaves the previous worker in service. Vite's hashed bundle cache is reused between builds. Versioned shell caches are removed only on activation, and only cache names belonging to this game are removed. Activation prunes obsolete immutable files to the new manifest.

## Runtime contract

Call `registerPwa(onStatus)` from `src/pwa.ts` once at boot. The callback receives `supported`, `online`, `offlineReady`, `updateAvailable`, optional `build`, and optional `error`. It must not block scene loading. `offlineReady` comes from checking every required cache entry in the controlling worker, not merely from registration succeeding. `navigator.onLine` is only a connectivity hint; it cannot prove the server is reachable.

Suggested parent-facing status: “Ready to play offline”, “Saving for offline play”, or “New version ready — close and reopen the game”. Keep the child's primary screen quiet; errors should leave play available and be inspectable in the parent area or development console.

The page never calls `skipWaiting` or reloads in response to an update. A new worker waits until all game windows using the old worker close. A normal refresh can show the newest online HTML while the previous installed version remains the offline fallback; cached HTML is never overwritten with a document whose bundles have not passed installation. Close every game tab/standalone window, then reopen to activate a pending update. A foreground return requests an update check and verifies current offline cache presence.

Only the root game navigation and declared same-origin public precache files are intercepted. Requests with authorization headers, third-party resources, API routes, other paths, and non-GET requests are untouched. Bundle caching is cache-first; navigation tries the network with a 2.5-second ceiling. An offline document falls back to the precached game, then the simple retry screen. HTTP 4xx navigation responses are preserved rather than disguised as a successful game response.

## iOS and hosting limits

Use HTTPS (or localhost for testing). Production builds register the worker; Vite development does not. The manifest requests landscape, but Safari/iOS controls whether orientation locking is respected, so the app must retain its rotate-to-landscape UI. Add to Home Screen remains a Safari user action; the game must also work in a regular Safari tab.

Offline play starts after a successful online installation reports readiness. First-ever offline visits cannot work. iOS can evict site storage; private browsing, low storage, and user-cleared website data can remove the offline installation. Status is rechecked on foregrounding. Readiness is a current cache check, not a promise of permanent storage.

`vercel.json` revalidates HTML and manifests, prevents stale worker HTTP caching, and makes `/assets/` immutable. Keep that directory exclusively for hashed Vite outputs. Public icons revalidate on online requests. No blanket SPA rewrite hides missing assets or routes.


## Acceptance

Run pnpm check, then verify online installation, offline reload, failed installation, and waiting updates.
Physical Safari and installed iOS checks remain pending. See project/TASK_LIST.md.
