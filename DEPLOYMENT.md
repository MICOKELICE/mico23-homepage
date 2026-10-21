# Deployment checklist

## GitHub files

Upload these root files to `MICOKELICE/mico23-homepage`:

- `index.html`
- `game.html`
- `request.html`
- `styles.css`
- `app.js`
- `games.js`
- `_headers`
- `README.md`
- `schema.sql`

Upload game images to `/assets/` and `requests.js` to `/functions/api/`.

## Cloudflare D1

1. Create a D1 database named `mico23-patch-requests`.
2. Open its Console and execute the contents of `schema.sql`.
   For an existing database, execute only the `CREATE TABLE IF NOT EXISTS request_progress` statement from `schema.sql`.
3. Open **Workers & Pages → mico23-homepage → Settings → Bindings**.
4. Add a D1 database binding named exactly `PATCH_DB` and select `mico23-patch-requests`.
5. Redeploy the latest production deployment if Cloudflare does not redeploy automatically.

## Owner-only status changes

The website intentionally has no status-edit button and the public API has no update endpoint. Use the authenticated D1 Console:

```sql
SELECT id, game_name, status, created_at FROM requests ORDER BY id DESC;
INSERT INTO request_progress (request_id, percent, updates_json)
VALUES (3, 20, json_array('Newest English update', 'Earlier English update'));
UPDATE request_progress SET percent = 30 WHERE request_id = 3;
UPDATE requests SET status = 'done' WHERE id = 1;
UPDATE requests SET status = 'list' WHERE id = 1;
```

An entry in `request_progress` places a List request under In Progress. Progress updates appear newest first and have no timestamps. The public API has no owner-editing route.

## Verification

- Search finds the game by English or Japanese title.
- The game card opens its details.
- VNDB, Google Drive, and MEGA open in new tabs.
- Request form accepts only `https://vndb.org/v<number>` links.
- A submitted request appears publicly under List.
- List pagination shows seven requests per page and preserves the full count.
- Done contains only owner-updated rows.
