# Mundial 2026

World Cup 2026 tracker (static PWA). Hosted on Firebase Hosting: https://mundial-2026-mg.web.app

## Deploy

1. If `js/app.js` or `css/style.css` changed, bump the version string (date-based, e.g. `20260612`) in **both** places:
   - `index.html`: the two `?v=` asset URLs (`css/style.css?v=...`, `js/app.js?v=...`)
   - `sw.js`: the `VERSION` const (cache name `mundial2026-<VERSION>` derives from it)
   This makes PWA/service-worker users pick up new files promptly.
2. Deploy with `firebase deploy --only hosting`.
3. JS/CSS/HTML are served with `no-cache` headers via `firebase.json`, so regular browsers revalidate automatically — the `?v=` bump is for the service worker cache.

Git pushes go to github.com/mariagarciaflores/mundial-2026 (credential username `mariagarciaflores`, ONE g).
