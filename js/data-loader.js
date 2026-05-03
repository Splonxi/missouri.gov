/* Shared data loading + small render helpers.
 * Loads JSON files from /data/, with localStorage overlay for admin previews.
 *
 * If a page is opened from file:// the fetch() will fail. We surface a
 * helpful message instead of an empty page in that case.
 */

const DATA_FILES = {
  site:       "data/site.json",
  bills:      "data/bills.json",
  orders:     "data/orders.json",
  statements: "data/statements.json",
  news:       "data/news.json",
  districts:  "data/wa-congressional-districts.geojson"
};

const LS_PREFIX = "wa_gov_admin_overlay_";

async function loadData(key) {
  const path = DATA_FILES[key];
  if (!path) throw new Error(`Unknown data key: ${key}`);

  // Check for an admin overlay (drafts saved before being exported as JSON).
  const overlay = localStorage.getItem(LS_PREFIX + key);
  if (overlay) {
    try {
      const parsed = JSON.parse(overlay);
      console.info(`[data-loader] Using localStorage overlay for ${key}. ` +
                   `Clear it from /admin.html to revert to /data/${path}.`);
      return parsed;
    } catch (e) {
      console.warn(`[data-loader] Bad overlay JSON for ${key}, falling through.`, e);
    }
  }

  try {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[data-loader] Failed loading ${path}:`, err);
    if (location.protocol === "file:") {
      throw new Error(
        `This site needs to be served over HTTP (fetch() blocked on file://). ` +
        `Run "python3 -m http.server" in this folder and open http://localhost:8000.`
      );
    }
    throw err;
  }
}

/* Format an ISO date as "April 29, 2026" */
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US",
    { year: "numeric", month: "long", day: "numeric" });
}

function formatDateShort(iso) {
  if (!iso) return "";
  const d = new Date(iso + (iso.length === 10 ? "T12:00:00" : ""));
  if (isNaN(d)) return iso;
  return d.toLocaleDateString("en-US",
    { year: "numeric", month: "short", day: "numeric" });
}

function escapeHTML(s) {
  if (s == null) return "";
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* Map a status string to a pill class */
function statusPill(status) {
  const map = {
    "in-committee":      ["gold",  "In committee"],
    "on-governors-desk": ["blue",  "On Governor's desk"],
    "signed":            ["green", "Signed into law"],
    "vetoed":            ["red",   "Vetoed"],
    "partial-veto":      ["red",   "Partial veto"],
    "stalled":           ["gray",  "Stalled"],
    "active":            ["green", "Active"],
    "rescinded":         ["gray",  "Rescinded"]
  };
  const [cls, label] = map[status] || ["gray", status || "—"];
  return `<span class="pill ${cls}">${escapeHTML(label)}</span>`;
}

function partyPill(party) {
  if (party === "D") return `<span class="pill blue">Democrat</span>`;
  if (party === "R") return `<span class="pill red">Republican</span>`;
  if (party === "I") return `<span class="pill gray">Independent</span>`;
  return "";
}

/* Render a "WA-themed photo slot" — uses image if it loads, else label. */
function photoSlot({ src, label, className = "" }) {
  // The CSS selector :not(:has(img)) handles styling; we always emit the
  // label, and conditionally emit an <img> with onerror fallback removal.
  const safeLabel = escapeHTML(label || "");
  const safeSrc = escapeHTML(src || "");
  const imgTag = src
    ? `<img src="${safeSrc}" alt="${safeLabel}" loading="lazy" onerror="this.remove()">`
    : "";
  return `
    <figure class="photo-slot ${className}">
      ${imgTag}
      <figcaption class="label">${safeLabel}</figcaption>
    </figure>
  `;
}
