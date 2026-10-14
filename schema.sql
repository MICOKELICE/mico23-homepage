CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_name TEXT NOT NULL CHECK(length(game_name) BETWEEN 2 AND 120),
  vndb_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'list' CHECK(status IN ('list', 'done')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status_created
ON requests(status, created_at DESC);

-- Owner-only status update example (run in Cloudflare D1 Console):
-- UPDATE requests SET status = 'done' WHERE id = 1;
