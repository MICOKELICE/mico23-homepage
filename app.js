(() => {
  const games = window.PATCH_GAMES || [];
  const body = document.body;
  const perPage = 6;

  const escapeHTML = (value = "") => value.replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[char]));

  const formatDate = (date) => new Intl.DateTimeFormat("en", {
    year: "numeric", month: "short", day: "numeric"
  }).format(new Date(`${date}T00:00:00`));

  const setupMenu = () => {
    const button = document.querySelector("[data-menu-toggle]");
    const sidebar = document.querySelector("[data-sidebar]");
    const scrim = document.querySelector("[data-menu-scrim]");
    if (!button || !sidebar || !scrim) return;
    const close = () => { sidebar.classList.remove("open"); scrim.classList.remove("open"); button.setAttribute("aria-expanded", "false"); };
    button.addEventListener("click", () => {
      const open = !sidebar.classList.contains("open");
      sidebar.classList.toggle("open", open); scrim.classList.toggle("open", open); button.setAttribute("aria-expanded", String(open));
    });
    scrim.addEventListener("click", close);
  };

  const renderCatalog = () => {
    const grid = document.querySelector("[data-game-grid]");
    if (!grid) return;
    const input = document.querySelector("[data-game-search]");
    const empty = document.querySelector("[data-empty]");
    const pagination = document.querySelector("[data-pagination]");
    const resultCount = document.querySelector("[data-result-count]");
    let page = 1;

    document.querySelectorAll("[data-game-count]").forEach((node) => { node.textContent = games.length; });
    const render = () => {
      const query = (input?.value || "").trim().toLowerCase();
      const filtered = games
        .filter((game) => [game.title, game.japaneseTitle, game.patchLabel].join(" ").toLowerCase().includes(query))
        .sort((a, b) => b.updated.localeCompare(a.updated));
      const pages = Math.max(1, Math.ceil(filtered.length / perPage));
      page = Math.min(page, pages);
      const pageGames = filtered.slice((page - 1) * perPage, page * perPage);
      resultCount.textContent = filtered.length;
      grid.innerHTML = pageGames.map((game) => `
        <article class="game-card">
          <a class="card-image" href="game.html?id=${encodeURIComponent(game.id)}">
            <img src="${game.thumbnail}" alt="${escapeHTML(game.title)} screenshot" loading="lazy">
            <span class="card-platform">${escapeHTML(game.platform)} · ${escapeHTML(game.rating)}</span>
            <span class="card-arrow" aria-hidden="true">↗</span>
          </a>
          <div class="card-copy">
            <p class="card-kicker">${escapeHTML(game.patchLabel)}</p>
            <h2><a href="game.html?id=${encodeURIComponent(game.id)}">${escapeHTML(game.title)}</a></h2>
            <p class="jp-title">${escapeHTML(game.japaneseTitle)}</p>
            <div class="card-meta"><span class="update-badge">Updated</span><time datetime="${game.updated}">${formatDate(game.updated)}</time></div>
          </div>
        </article>`).join("");
      empty.hidden = filtered.length > 0;
      pagination.innerHTML = Array.from({ length: pages }, (_, index) => {
        const number = index + 1;
        return `<button type="button" ${number === page ? 'class="active" aria-current="page"' : ""} data-page-number="${number}">${number}</button>`;
      }).join("");
      pagination.querySelectorAll("button").forEach((button) => button.addEventListener("click", () => {
        page = Number(button.dataset.pageNumber); render(); window.scrollTo({ top: 0, behavior: "smooth" });
      }));
    };
    input?.addEventListener("input", () => { page = 1; render(); });
    render();
  };

  const renderDetail = () => {
    const host = document.querySelector("[data-game-detail]");
    if (!host) return;
    const id = new URLSearchParams(location.search).get("id") || games[0]?.id;
    const game = games.find((item) => item.id === id);
    if (!game) { host.innerHTML = '<div class="not-found"><h1>Game not found</h1><a href="index.html">Return to the library</a></div>'; return; }
    document.title = `${game.title} · Mico Patch Archive`;
    host.innerHTML = `
      <section class="detail-hero">
        <div class="detail-backdrop" style="background-image:url('${game.thumbnail}')"></div>
        <div class="detail-overlay"></div>
        <div class="detail-content">
          <img class="game-cover" src="${game.cover}" alt="${escapeHTML(game.title)} cover art">
          <div class="detail-copy">
            <p class="eyebrow">${escapeHTML(game.patchLabel)}</p>
            <h1>${escapeHTML(game.title)}</h1>
            <p class="detail-jp">${escapeHTML(game.japaneseTitle)}</p>
            <div class="detail-tags"><span>Windows</span><span class="rating-tag">${escapeHTML(game.rating)}</span><span>English patch</span><span>Updated ${formatDate(game.updated)}</span></div>
            <p class="detail-description">${escapeHTML(game.description)}</p>
            <dl class="game-facts">
              <div><dt>Developer</dt><dd>${escapeHTML(game.developer)}</dd></div>
              <div><dt>Play time</dt><dd>${escapeHTML(game.playtime)}</dd></div>
              <div><dt>Platform</dt><dd>${escapeHTML(game.platform)}</dd></div>
              <div><dt>Age rating</dt><dd class="rating-value">${escapeHTML(game.rating)}</dd></div>
            </dl>
            <a class="vndb-link" href="${game.vndb}" target="_blank" rel="noopener noreferrer">View on VNDB <span>↗</span></a>
          </div>
        </div>
      </section>

      <section class="detail-section">
        <div class="section-title"><span>01</span><div><h2>In-game gallery</h2><p>English patch interface and gameplay previews.</p></div></div>
        <div class="screenshot-grid">${game.screenshots.map((src, index) => `<button type="button" data-gallery-image="${src}" aria-label="Open screenshot ${index + 1}"><img src="${src}" alt="${escapeHTML(game.title)} gameplay screenshot ${index + 1}" loading="lazy"><span>View image ↗</span></button>`).join("")}</div>
      </section>

      <section class="download-section">
        <div><p class="eyebrow">Patch download</p><h2>Choose a mirror</h2><p>Both links contain the same patch files. The original game is not included.</p></div>
        <div class="download-buttons">
          <a class="download-button drive" href="${game.googleDrive}" target="_blank" rel="noopener noreferrer"><span class="download-logo">△</span><span><small>Download from</small>Google Drive</span><b>↗</b></a>
          <a class="download-button mega" href="${game.mega}" target="_blank" rel="noopener noreferrer"><span class="download-logo">M</span><span><small>Download from</small>MEGA</span><b>↗</b></a>
        </div>
      </section>

      <footer class="site-footer detail-footer"><p><strong>Disclaimer</strong> — This fan-made patch is provided only for language learning, research, and community exchange. No original game files are distributed. Purchase and own the original Windows release before using it.</p><span>Artwork © its respective owners</span></footer>`;

    const lightbox = document.querySelector("[data-lightbox]");
    const lightboxImage = document.querySelector("[data-lightbox-image]");
    const close = () => { lightbox.hidden = true; body.classList.remove("no-scroll"); };
    host.querySelectorAll("[data-gallery-image]").forEach((button) => button.addEventListener("click", () => {
      lightboxImage.src = button.dataset.galleryImage; lightbox.hidden = false; body.classList.add("no-scroll");
    }));
    document.querySelector("[data-lightbox-close]")?.addEventListener("click", close);
    lightbox?.addEventListener("click", (event) => { if (event.target === lightbox) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !lightbox.hidden) close(); });
  };

  const setupRequests = () => {
    const form = document.querySelector("[data-request-form]");
    const list = document.querySelector("[data-request-list]");
    if (!form || !list) return;
    let requests = [];
    let activeStatus = "list";

    const renderRequests = () => {
      const visible = requests.filter((item) => item.status === activeStatus);
      document.querySelector("[data-list-count]").textContent = requests.filter((item) => item.status === "list").length;
      document.querySelector("[data-done-count]").textContent = requests.filter((item) => item.status === "done").length;
      list.innerHTML = visible.length ? visible.map((item) => `
        <article class="request-item">
          <div><a href="${escapeHTML(item.vndb_url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(item.game_name)}</a><p>Submitted ${formatDate(item.created_at.slice(0, 10))} · <span>VNDB ↗</span></p></div>
          <span class="status-pill ${item.status}">${item.status === "done" ? "Done" : "List"}</span>
        </article>`).join("") : `<div class="board-empty"><span>◇</span><h3>No ${activeStatus === "done" ? "completed" : "pending"} requests yet</h3><p>${activeStatus === "done" ? "Completed work will appear here." : "Be the first to suggest a title."}</p></div>`;
    };

    const load = async () => {
      try {
        const response = await fetch("/api/requests", { headers: { Accept: "application/json" } });
        if (!response.ok) throw new Error("Request service unavailable");
        requests = await response.json(); renderRequests();
      } catch {
        list.innerHTML = '<div class="board-empty"><span>!</span><h3>Request board is not connected yet</h3><p>The Cloudflare database binding will be enabled during deployment.</p></div>';
      }
    };

    document.querySelectorAll("[data-status-tab]").forEach((tab) => tab.addEventListener("click", () => {
      activeStatus = tab.dataset.statusTab;
      document.querySelectorAll("[data-status-tab]").forEach((item) => item.classList.toggle("active", item === tab));
      renderRequests();
    }));

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const message = document.querySelector("[data-form-message]");
      const button = form.querySelector("button[type=submit]");
      const data = Object.fromEntries(new FormData(form));
      message.className = "form-message"; message.textContent = "Submitting…"; button.disabled = true;
      try {
        const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Unable to submit request");
        form.reset(); message.classList.add("success"); message.textContent = "Request added to the public list."; await load();
      } catch (error) {
        message.classList.add("error"); message.textContent = error.message;
      } finally { button.disabled = false; }
    });
    load();
  };

  setupMenu();
  if (body.dataset.page === "games") renderCatalog();
  if (body.dataset.page === "detail") renderDetail();
  if (body.dataset.page === "requests") setupRequests();
})();
