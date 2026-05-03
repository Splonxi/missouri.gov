<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Executive Orders — Office of the Governor</title>
  <link rel="stylesheet" href="css/style.css">
  <link rel="icon" type="image/svg+xml" href="assets/stateseal.svg">
</head>
<body>
  <div id="chrome-header"></div>

  <section class="tight" style="background:var(--paper); border-bottom:1px solid var(--line);">
    <div class="container">
      <span class="section-eyebrow">Executive Orders</span>
      <h1 class="mb-0">Index of Executive Orders</h1>
      <p class="muted mt-1 mb-0">All executive orders issued by the Governor, current administration first.</p>
    </div>
  </section>

  <section>
    <div class="container">
      <div class="filter-bar">
        <label class="grow">
          Search
          <input type="search" id="f-search" placeholder="Search EO number, title, topic, summary…">
        </label>
        <label>
          Status
          <select id="f-status">
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="rescinded">Rescinded</option>
          </select>
        </label>
      </div>

      <div id="results-meta" class="muted mb-2"></div>

      <div id="orders-list">
        <div class="skeleton">Loading…</div>
      </div>
    </div>
  </section>

  <div id="chrome-footer"></div>

  <script src="js/main.js"></script>
  <script src="js/data-loader.js"></script>
  <script>
    renderChrome("orders");

    let allOrders = [];

    function render() {
      const search = document.getElementById("f-search").value;
      const status = document.getElementById("f-status").value;
      const filtered = applyFilter(allOrders, { search, filters: { status } });
      const sorted = sortByDate(filtered, "issued");

      document.getElementById("results-meta").textContent =
        `${sorted.length} of ${allOrders.length} orders shown`;

      const list = document.getElementById("orders-list");
      if (sorted.length === 0) {
        list.innerHTML = `<div class="muted center">No orders match these filters.</div>`;
        return;
      }
      list.innerHTML = sorted.map(o => `
        <article id="${escapeHTML(o.id)}" class="form-card mb-2" style="border-top-color: var(--green-900);">
          <div class="flex between align-center" style="flex-wrap:wrap;">
            <div>
              <div class="kicker">Executive Order ${escapeHTML(o.number)} · ${formatDate(o.issued)}</div>
              <h3 style="margin:.25rem 0 .25rem;">${escapeHTML(o.title)}</h3>
            </div>
            <div class="tag-row">${statusPill(o.status)}</div>
          </div>
          <p style="margin-top:.75rem;">${escapeHTML(o.summary)}</p>
          ${o.supersedes ? `<p class="muted" style="font-size:.88rem;">Supersedes: ${escapeHTML(o.supersedes)}</p>` : ""}
          <div class="tag-row mt-2">
            ${(o.topics || []).map(t => `<span class="pill">${escapeHTML(t)}</span>`).join(" ")}
          </div>
        </article>
      `).join("");

      const hash = location.hash.slice(1);
      if (hash) {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    (async () => {
      try {
        allOrders = await loadData("orders");
        render();
      } catch (err) {
        document.getElementById("orders-list").innerHTML =
          `<div class="callout danger">Could not load executive orders: ${escapeHTML(err.message)}</div>`;
      }
    })();

    ["f-search","f-status"].forEach(id =>
      document.getElementById(id).addEventListener("input", render)
    );
  </script>
</body>
</html>
