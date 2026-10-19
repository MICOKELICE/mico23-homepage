const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  }
});

export async function onRequestGet({ env }) {
  if (!env.PATCH_DB) return json({ error: "Database binding is not configured." }, 503);
  const { results } = await env.PATCH_DB.prepare(
    `SELECT r.id, r.game_name, r.vndb_url, r.created_at,
      CASE WHEN r.status = 'list' AND p.request_id IS NOT NULL THEN 'in_progress' ELSE r.status END AS status,
      p.percent AS progress_percent, p.updates_json
    FROM requests r LEFT JOIN request_progress p ON p.request_id = r.id
    ORDER BY r.created_at DESC, r.id DESC LIMIT 200`
  ).all();
  return json((results || []).map(({ updates_json, ...row }) => {
    let progress_updates = [];
    try {
      const parsed = JSON.parse(updates_json || "[]");
      if (Array.isArray(parsed)) progress_updates = parsed.filter((entry) => typeof entry === "string");
    } catch { /* Ignore malformed owner-entered progress notes. */ }
    return { ...row, progress_updates };
  }));
}

export async function onRequestPost({ request, env }) {
  if (!env.PATCH_DB) return json({ error: "Database binding is not configured." }, 503);
  let payload;
  try { payload = await request.json(); } catch { return json({ error: "Invalid request body." }, 400); }

  const gameName = String(payload.gameName || "").trim().replace(/\s+/g, " ");
  const vndbUrl = String(payload.vndbUrl || "").trim();
  const honeypot = String(payload.website || "").trim();
  if (honeypot) return json({ ok: true }, 201);
  if (gameName.length < 2 || gameName.length > 120) return json({ error: "Game name must be 2–120 characters." }, 400);
  if (!/^https:\/\/(?:www\.)?vndb\.org\/v\d+\/?$/i.test(vndbUrl)) return json({ error: "Please enter a valid VNDB title link." }, 400);

  const duplicate = await env.PATCH_DB.prepare(
    "SELECT id FROM requests WHERE lower(vndb_url) = lower(?) AND created_at > datetime('now', '-10 minutes') LIMIT 1"
  ).bind(vndbUrl).first();
  if (duplicate) return json({ error: "This VNDB title was submitted recently." }, 409);

  const result = await env.PATCH_DB.prepare(
    "INSERT INTO requests (game_name, vndb_url, status) VALUES (?, ?, 'list')"
  ).bind(gameName, vndbUrl).run();
  return json({ ok: true, id: result.meta?.last_row_id }, 201);
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: { Allow: "GET, POST, OPTIONS" } });
}
