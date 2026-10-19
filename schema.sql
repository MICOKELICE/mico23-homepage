CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  game_name TEXT NOT NULL CHECK(length(game_name) BETWEEN 2 AND 120),
  vndb_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'list' CHECK(status IN ('list', 'done')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_requests_status_created
ON requests(status, created_at DESC);

-- Owner-managed translation progress. A row here moves a List request into
-- In Progress without changing the existing requests status constraint.
CREATE TABLE IF NOT EXISTS request_progress (
  request_id INTEGER PRIMARY KEY REFERENCES requests(id) ON DELETE CASCADE,
  percent INTEGER NOT NULL CHECK(percent BETWEEN 0 AND 100),
  updates_json TEXT NOT NULL DEFAULT '[]'
);

-- Owner-only status update example (run in Cloudflare D1 Console):
-- UPDATE requests SET status = 'done' WHERE id = 1;
