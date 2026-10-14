# Mico Patch Archive

A responsive visual-novel translation patch library for `mico23.site`.

## Pages

- `index.html` — searchable game catalog with six games per page.
- `game.html?id=...` — game description, gallery, VNDB link, and Google Drive/MEGA mirrors.
- `request.html` — public request form with List and Done tabs.
- `functions/api/requests.js` — Cloudflare Pages Function for reading and creating requests.

## Add another game

1. Put its optimized cover and screenshots in `assets/`.
2. Add one object to `window.PATCH_GAMES` in `games.js`.
3. Commit the files. Cloudflare Pages redeploys automatically.

The catalog sorts by `updated` and automatically paginates at six games per page.

## Request database

Create a Cloudflare D1 database, run `schema.sql`, and bind it to the Pages project using the variable name `PATCH_DB`. The public API intentionally supports only `GET` and `POST`; it has no public status-update route.

To mark a request done, run this in the authenticated Cloudflare D1 console:

```sql
UPDATE requests SET status = 'done' WHERE id = 1;
```

## Local preview

Serve the project root with any static web server. The Request page will show a database-connection notice locally because Pages Functions and D1 run on Cloudflare.
