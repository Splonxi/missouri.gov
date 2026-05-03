# State Government Mockup Page

Static mockup site for sim use. Deployable to GitHub Pages as-is.

## Quick start (local)

Because the site loads JSON via `fetch()`, you need to serve it over HTTP — opening `index.html` directly in a browser will fail. From this folder run any one of:

```bash
python3 -m http.server 8000
# or
npx serve .
```

Then visit http://localhost:8000.

## Deploying to GitHub Pages

1. Push this folder to a GitHub repo (e.g. `gov-wa-sim`).
2. Repo → Settings → Pages → Source: `main` branch, root folder.
3. Site will be live at `https://<your-username>.github.io/<repo-name>/`.

The admin panel lets you draft new bills, executive orders, statements, and news bulletins. Submitting a draft **downloads an updated JSON file** that you commit to `/data/` to publish it. (Browser localStorage also caches drafts so you can preview before exporting.)

This is a sim — there is no real auth. The credentials are hardcoded in `js/admin.js`. Anyone with the URL can read them. Don't use this for anything real.

## Replaceable assets

Drop your own files in `/assets/` to replace placeholders:

| File                        | Used by                                          |
|-----------------------------|--------------------------------------------------|
| `signature.svg`             | Auto-appended to every official statement        |
| `stateseal.svg`             | Header, letterhead, statement template           |
| `governor-portrait.jpg`     | About the Governor section on landing page       |
| `photos/seattle.jpg`        | Landing page hero / cities section               |
| `photos/spokane.jpg`        | Cities section                                   |
| `photos/rainier.jpg`        | Mountains section                                |
| `photos/olympics.jpg`       | Mountains section                                |
| `photos/sanjuans.jpg`       | Archipelagos section                             |
| `photos/palouse.jpg`        | Eastern WA section                               |
| `photos/capitol.jpg`        | Footer / about                                   |

If a file is missing the slot shows a styled placeholder — nothing breaks.

## Congressional district map

`data/wa-congressional-districts.geojson` ships with WA's 10 congressional districts. For accurate boundaries, replace the file with your own version.

The file must be valid GeoJSON, EPSG:4326 (WGS84), with each feature carrying at minimum `properties.district` (number) and ideally `properties.representative`.

## Editing the site

- Pages: `*.html` at the root
- Styles: `css/style.css`
- Shared JS: `js/main.js`, `js/data-loader.js`
- Admin panel: `js/admin.js`
- Map: `js/map.js`
- Budget spreadsheet: set `BUDGET_SPREADSHEET_URL` in `budget.html` to a shareable Google Sheets link

## Data files

| File                 | What it holds                        |
|----------------------|--------------------------------------|
| `data/bills.json`    | Legislative tracker entries          |
| `data/orders.json`   | Executive orders                     |
| `data/statements.json` | Official statements                |
| `data/news.json`     | News bulletin posts                  |
| `data/site.json`     | Governor bio, About text, hero copy  |

All files are arrays of objects with `id`, `date`, and entry-specific fields. The admin panel produces drop-in replacements for these files.
