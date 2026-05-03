/* WA congressional districts map -- retrofit for the real geojson. */
(function () {
  "use strict";

  var DEM = "#2b5d8a", REP = "#8b1e1e";

  // Static info the geojson doesn't carry -- edit freely.
  var REPS = {
    1:  { rep: "Rep. Meredith Grey, M.D.",                  city: "Redmond",    note: "North King & Snohomish" },
    2:  { rep: "Rep. Derek Shepherd, M.D., F.A.A.N.S.",     city: "Bellingham", note: "Bellingham, Everett, San Juans" },
    3:  { rep: "Rep. Cristina Yang, M.D., F.A.C.S.",        city: "Vancouver",  note: "SW Washington" },
    4:  { rep: "Rep. Miranda Bailey, M.D.",                 city: "Yakima",     note: "Central WA, Tri-Cities" },
    5:  { rep: "Rep. Richard Webber, M.D.",                 city: "Spokane",    note: "Spokane, NE Washington" },
    6:  { rep: "Rep. Owen Hunt, M.D., F.A.C.S.",            city: "Tacoma",     note: "Olympic Peninsula, Tacoma" },
    7:  { rep: "Rep. Mark Sloan, M.D.",                     city: "Seattle",    note: "Seattle proper" },
    8:  { rep: "Rep. Callie Torres, M.D.",                  city: "Wenatchee",  note: "East King, Cascades" },
    9:  { rep: "Rep. Arizona Robbins, M.D., F.A.A.P.",      city: "Bellevue",   note: "South King, Bellevue" },
    10: { rep: "Rep. Jackson Avery, M.D., F.A.C.S.",        city: "Olympia",    note: "Olympia, South Sound" }
  };

  function dPct(p) { return Number(p.DemPct || 0); }
  function rPct(p) { return Number(p.RepPct || 0); }
  function leansDem(p) { return Number(p.Margin || 0) >= 0; }

  var COLOR_FNS = {
    party: function (f) { return leansDem(f.properties) ? DEM : REP; },
    margin: function (f) {
      // Stronger margin -> deeper color
      var m = Math.abs(Number(f.properties.Margin || 0));
      var t = Math.max(0, Math.min(1, m / 0.20));
      var base = leansDem(f.properties) ? [180, 210, 230] : [230, 190, 190];
      var dark = leansDem(f.properties) ? [20, 70, 130]   : [130, 30, 30];
      return "rgb(" +
        Math.round(base[0] + (dark[0] - base[0]) * t) + "," +
        Math.round(base[1] + (dark[1] - base[1]) * t) + "," +
        Math.round(base[2] + (dark[2] - base[2]) * t) + ")";
    },
    population: function (f) {
      // Districts are equally apportioned (~770K each); deviation is tiny
      // but we ramp on PopDevPct so user can see who's slightly over/under.
      var d = Number(f.properties.PopDevPct || 0);
      var t = Math.max(-1, Math.min(1, d * 100000));
      if (t >= 0) {
        return "rgb(" + Math.round(232 - t * 100) + "," + Math.round(239 - t * 60) + "," + Math.round(218 - t * 80) + ")";
      } else {
        return "rgb(" + Math.round(232 + t * 50) + "," + Math.round(220 + t * 60) + "," + Math.round(245 - t * 30) + ")";
      }
    },
    minority: function (f) {
      var v = Number(f.properties.MinorityPct || 0);
      var t = Math.max(0, Math.min(1, v / 0.5));
      return "rgb(" + Math.round(245 - t * 100) + "," + Math.round(225 - t * 80) + "," + Math.round(190 - t * 100) + ")";
    }
  };

  var mapInstance = null, geoLayer = null, labelLayer = null, currentColorBy = "party";

  function styleFn(f) {
    return { fillColor: (COLOR_FNS[currentColorBy] || COLOR_FNS.party)(f),
             weight: 1.5, opacity: 1, color: "#fff", fillOpacity: 0.78 };
  }

  function pct(v) { return (Number(v || 0) * 100).toFixed(1) + "%"; }
  function num(v) { return Number(v || 0).toLocaleString(); }

  function demoBar(label, value, color) {
    var w = Math.max(0, Math.min(100, Number(value || 0) * 100));
    return '<div style="display:flex; align-items:center; gap:.4rem; font-size:.82rem; margin:.15rem 0;">' +
             '<span style="width:80px; color:#5f6b66;">' + label + '</span>' +
             '<span style="flex-grow:1; height:8px; background:#eee; border-radius:2px; overflow:hidden;">' +
               '<span style="display:block; width:' + w.toFixed(1) + '%; height:100%; background:' + color + ';"></span>' +
             '</span>' +
             '<span style="width:48px; text-align:right; font-variant-numeric: tabular-nums;">' + pct(value) + '</span>' +
           '</div>';
  }

  function showDetail(p) {
    var el = document.getElementById("district-detail");
    if (!el) return;
    var meta = REPS[p.id] || { rep: "--", city: "--", note: "" };
    var dem = leansDem(p);
    var marginPct = (Math.abs(Number(p.Margin || 0)) * 100).toFixed(1) + " pts";
    el.innerHTML =
      '<h3 style="margin:0 0 .25rem;">WA-' + p.id + '</h3>' +
      '<div class="kicker" style="color:' + (dem ? DEM : REP) + ';">' +
        (dem ? "Dem +" : "Rep +") + marginPct + '</div>' +
      '<p style="margin:.5rem 0;"><strong>' + escapeHTML(meta.rep) + '</strong><br>' +
        '<span class="muted">Largest city: ' + escapeHTML(meta.city) + '</span></p>' +
      '<p class="muted" style="font-size:.85rem;">' + escapeHTML(meta.note) + '</p>' +
      '<hr class="divider">' +
      '<table style="width:100%; font-size:.92rem; margin-bottom:.6rem;">' +
        '<tr><td class="muted">Total population</td><td><strong>' + num(p.TotalPop) + '</strong></td></tr>' +
        '<tr><td class="muted">Voting-age pop.</td><td><strong>' + num(p.TotalVAP) + '</strong></td></tr>' +
        '<tr><td class="muted">Dem vote share</td><td>' + pct(p.DemPct) + '</td></tr>' +
        '<tr><td class="muted">Rep vote share</td><td>' + pct(p.RepPct) + '</td></tr>' +
      '</table>' +
      '<div class="kicker" style="color:#5f6b66; margin-bottom:.25rem;">Demographics</div>' +
      demoBar("White",     p.WhitePct,    "#5b8c5a") +
      demoBar("Hispanic",  p.HispanicPct, "#c89211") +
      demoBar("Asian",     p.AsianPct,    "#2b5d8a") +
      demoBar("Black",     p.BlackPct,    "#7a5b06") +
      demoBar("Native",    p.NativePct,   "#8b1e1e") +
      demoBar("Pacific",   p.PacificPct,  "#1d6048");
  }

  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: function (e) {
        e.target.setStyle({ weight: 3, color: "#003a25", fillOpacity: 0.92 });
        e.target.bringToFront();
        showDetail(feature.properties);
      },
      mouseout: function (e) { geoLayer.resetStyle(e.target); },
      click: function () {
        try { mapInstance.fitBounds(layer.getBounds(), { padding: [20, 20] }); } catch (_) {}
        showDetail(feature.properties);
      }
    });
    var p = feature.properties, meta = REPS[p.id] || {};
    layer.bindTooltip(
      '<strong>WA-' + p.id + '</strong> - ' + escapeHTML(meta.rep || "") +
      '<br>' + (leansDem(p) ? "Dem" : "Rep") + ' +' + (Math.abs(Number(p.Margin||0))*100).toFixed(1) + 'pts',
      { sticky: true, direction: "top" }
    );
  }

  // --- side-panel charts ---
  function bar(target, items, opts) {
    var el = document.getElementById(target);
    if (!el) return;
    var max = 0;
    items.forEach(function (d) { var v = opts.value(d); if (v > max) max = v; });
    var rowH = 22, labelW = 50, w = 280, barMax = w - labelW - 60;
    var fmt = opts.format || function (v) { return v; };
    var rows = items.map(function (d, i) {
      var v = opts.value(d);
      var bw = max > 0 ? Math.max(2, (v / max) * barMax) : 0;
      var y = i * rowH + 6;
      var color = opts.color ? opts.color(d) : "#1d6048";
      return '<g transform="translate(0,' + y + ')">' +
        '<text x="0" y="13" font-size="11" fill="#1c1c1c">WA-' + d.properties.id + '</text>' +
        '<rect x="' + labelW + '" y="2" width="' + bw + '" height="14" fill="' + color + '" rx="2"/>' +
        '<text x="' + (labelW + bw + 4) + '" y="13" font-size="11" fill="#5f6b66">' + fmt(v) + '</text>' +
        '</g>';
    }).join("");
    var totalH = items.length * rowH + 10;
    el.innerHTML = '<svg viewBox="0 0 ' + w + ' ' + totalH + '" width="100%" height="' + totalH + '" xmlns="http://www.w3.org/2000/svg">' + rows + '</svg>';
  }

  function donut(target, features) {
    var el = document.getElementById(target);
    if (!el) return;
    var d = 0, r = 0;
    features.forEach(function (f) { if (leansDem(f.properties)) d++; else r++; });
    var total = features.length, cx = 65, cy = 65, R = 50, sw = 18;
    var C = 2 * Math.PI * R;
    var dLen = (d / total) * C;
    var rLen = (r / total) * C;
    el.innerHTML =
      '<div style="display:flex; gap:1rem; align-items:center;">' +
        '<svg width="130" height="130" viewBox="0 0 130 130">' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + DEM + '" stroke-width="' + sw + '" stroke-dasharray="' + dLen + ' ' + (C - dLen) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="' + REP + '" stroke-width="' + sw + '" stroke-dasharray="' + rLen + ' ' + (C - rLen) + '" stroke-dashoffset="' + (-dLen) + '" transform="rotate(-90 ' + cx + ' ' + cy + ')"/>' +
          '<text x="' + cx + '" y="' + (cy+4) + '" text-anchor="middle" font-family="Georgia,serif" font-size="22" fill="#003a25" font-weight="600">' + total + '</text>' +
          '<text x="' + cx + '" y="' + (cy+22) + '" text-anchor="middle" font-size="9" fill="#5f6b66" letter-spacing="1">DISTRICTS</text>' +
        '</svg>' +
        '<div style="flex-grow:1; font-size:.85rem;">' +
          '<div style="display:flex; align-items:center; gap:.4rem;"><span class="swatch" style="background:' + DEM + ';"></span>Dem-leaning<span class="muted" style="margin-left:auto;">' + d + '</span></div>' +
          '<div style="display:flex; align-items:center; gap:.4rem; margin-top:.25rem;"><span class="swatch" style="background:' + REP + ';"></span>Rep-leaning<span class="muted" style="margin-left:auto;">' + r + '</span></div>' +
        '</div>' +
      '</div>';
  }

  function fail(msg) {
    var el = document.getElementById("map");
    if (el) el.innerHTML = '<div class="callout danger" style="margin:2rem;"><strong>Map could not load.</strong><br>' + escapeHTML(msg) + '<br><br>Try a hard reload (Ctrl+Shift+R).</div>';
    if (window.console) console.error("[map] " + msg);
  }

  window.initMap = function () {
    if (window.__waMapInitialized) return;     // guard against double-init
    window.__waMapInitialized = true;
    if (typeof L === "undefined") { fail("Leaflet did not load."); return; }

    loadData("districts").then(function (geojson) {
      if (!geojson || !geojson.features || !geojson.features.length) { fail("districts geojson has no features."); return; }

      mapInstance = L.map("map", { zoomControl: true, scrollWheelZoom: false, minZoom: 5 }).setView([47.4, -120.7], 7);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "(c) OpenStreetMap contributors", maxZoom: 11 }).addTo(mapInstance);

      geoLayer = L.geoJSON(geojson, { style: styleFn, onEachFeature: onEachFeature }).addTo(mapInstance);
      try { mapInstance.fitBounds(geoLayer.getBounds(), { padding: [20, 20] }); } catch (_) {}

      // District number labels (uses top-level "labels" feature collection if present)
      if (geojson.labels && geojson.labels.features) {
        labelLayer = L.layerGroup().addTo(mapInstance);
        geojson.labels.features.forEach(function (lf) {
          var c = lf.geometry.coordinates;
          L.marker([c[1], c[0]], {
            icon: L.divIcon({
              className: "",
              html: '<div style="font:600 13px Georgia,serif; color:#fff; text-shadow:0 0 3px #000,0 0 3px #000; pointer-events:none;">' + escapeHTML(lf.properties["text-field"] || lf.properties.NAME || "") + '</div>',
              iconSize: [20, 20], iconAnchor: [10, 10]
            }),
            interactive: false
          }).addTo(labelLayer);
        });
      }

      var sorted = geojson.features.slice().sort(function (a, b) { return Number(a.properties.id) - Number(b.properties.id); });
      showDetail(sorted[0].properties);

      donut("party-chart", geojson.features);
      bar("pop-chart", sorted, {
        value: function (d) { return Number(d.properties.TotalPop || 0); },
        color: function (d) { return leansDem(d.properties) ? DEM : REP; },
        format: function (v) { return (v / 1000).toFixed(0) + "K"; }
      });
      bar("inc-chart", sorted, {
        value: function (d) { return Number(d.properties.Margin || 0) * 100; },
        color: function (d) { return leansDem(d.properties) ? DEM : REP; },
        format: function (v) { return (v >= 0 ? "+" : "") + v.toFixed(1) + "pts"; }
      });

      var radios = document.querySelectorAll("input[name='color-by']");
      for (var i = 0; i < radios.length; i++) {
        radios[i].addEventListener("change", function (e) {
          currentColorBy = e.target.value;
          if (geoLayer) geoLayer.setStyle(styleFn);
        });
      }

      if (geojson.metadata && geojson.metadata._placeholder) {
        var w = document.getElementById("placeholder-warning");
        if (w) w.style.display = "block";
      }
    }).catch(function (err) {
      fail("Could not load districts geojson: " + (err && err.message ? err.message : String(err)));
    });
  };
})();

// Self-bootstrap: run automatically when DOM is ready, regardless of whether
// map.html calls initMap() or not. Belt-and-suspenders.
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      if (window.initMap) window.initMap();
    });
  } else {
    setTimeout(function () { if (window.initMap) window.initMap(); }, 0);
  }
}
