// Static generator for ParkQuest park detail pages.
//
//   node build.mjs
//
// Reads site/parks.js (PARKS) + data/nps-units.json (official NPS descriptions,
// public domain) and writes site/parks/<slug>/index.html plus a /parks/ index
// and a regenerated sitemap.xml. Output is plain static HTML with no runtime
// dependencies — the build step exists only so 60+ pages stay consistent.
//
// Park facts come from the NPS API cache. A park with no cached NPS entry is
// SKIPPED and reported rather than published with invented content.

import fs from "fs";
import path from "path";

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const SITE = path.join(ROOT, "site");
const ORIGIN = "https://parkquest-national-parks.pages.dev";

// --- load data -------------------------------------------------------------
const parksSrc = fs.readFileSync(path.join(SITE, "parks.js"), "utf8");
const scope = {};
new Function("g", parksSrc + "\ng.PARKS=PARKS; g.REGIONS=REGIONS;")(scope);
const { PARKS, REGIONS } = scope;
const NPS = JSON.parse(fs.readFileSync(path.join(ROOT, "data/nps-units.json"), "utf8"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function shell({ title, desc, canonical, nav, body, extraHead = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<link rel="canonical" href="${canonical}" />
<link rel="stylesheet" href="/style.css" />
${extraHead}</head>
<body data-nav="${nav}">
${body}
</body>
</html>
`;
}

function parkPage(p, publishedSlugs) {
  const nps = NPS[p.code];
  const region = REGIONS[p.region];
  const official = nps.fullName;
  const designation = nps.designation || "National Park";
  const states = nps.states || p.state;

  // Only link parks that actually have a page, otherwise the sidebar 404s.
  const related = PARKS.filter(
    (x) => x.region === p.region && x.slug !== p.slug && publishedSlugs.has(x.slug)
  ).slice(0, 6);

  const title = `${p.name} National Park — Guide, Map & Visit Checklist | ParkQuest`;
  const desc = `${official}: location, designation, established ${p.established}, and an interactive checklist to mark it visited. Part of the free ParkQuest tracker for all 63 US National Parks.`;

  const jsonld = {
    "@context": "https://schema.org",
    "@type": "Park",
    name: official,
    description: nps.description,
    address: { "@type": "PostalAddress", addressRegion: states, addressCountry: "US" },
    geo: { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng },
    isAccessibleForFree: true,
    url: `${ORIGIN}/parks/${p.slug}/`,
    sameAs: nps.url,
  };

  const body = `
<header class="hero hero-park">
  <div class="wrap">
    <a class="back-link" href="/">&larr; All 63 national parks</a>
    <h1>${esc(p.name)} National Park</h1>
    <p>${esc(region.icon)} ${esc(states)} &middot; ${esc(designation)} &middot; Established ${p.established}</p>
  </div>
</header>

<div class="wrap">
  <div class="park-detail">
    <div class="park-detail-main">
      <div class="checkin-card">
        <div>
          <strong id="checkin-title">Have you visited ${esc(p.name)}?</strong>
          <div class="checkin-sub" id="checkin-sub">Your answer is saved in this browser and syncs with your checklist.</div>
        </div>
        <button id="checkin-btn" class="btn-toggle" data-slug="${p.slug}">Mark as visited</button>
      </div>

      <h2>About ${esc(p.name)}</h2>
      <p class="park-desc">${esc(nps.description)}</p>
      <p class="source-note">Description from the <a href="${nps.url}" rel="noopener">official National Park Service page</a> (public domain).</p>

      <h2>Quick facts</h2>
      <table class="facts">
        <tr><th>Official name</th><td>${esc(official)}</td></tr>
        <tr><th>Designation</th><td>${esc(designation)}</td></tr>
        <tr><th>State${/[,/]/.test(states) ? "s" : ""}</th><td>${esc(states)}</td></tr>
        <tr><th>Region</th><td>${esc(region.name)}</td></tr>
        <tr><th>Established</th><td>${p.established}</td></tr>
        <tr><th>Coordinates</th><td>${p.lat}, ${p.lng}</td></tr>
      </table>
    </div>

    <aside class="park-detail-side">
      <h2>More in ${esc(region.name)}</h2>
      <ul class="related">
        ${related.map((r) => `<li><a href="/parks/${r.slug}/">${esc(r.name)}</a> <span>${esc(r.state)}</span></li>`).join("\n        ")}
      </ul>
      <a class="side-cta" href="/map/">See all 63 on the map &rarr;</a>
    </aside>
  </div>

  <footer>
    ParkQuest &mdash; a free checklist, tracker and map for all 63 US National Parks. Progress is saved privately in your browser.
    <br />Park information courtesy of the <a href="https://www.nps.gov/">National Park Service</a>.
  </footer>
</div>

<script src="/parks.js"></script>
<script src="/park-page.js"></script>`;

  return shell({
    title,
    desc,
    canonical: `${ORIGIN}/parks/${p.slug}/`,
    nav: "parks",
    body,
    extraHead: `<script type="application/ld+json">${JSON.stringify(jsonld)}</script>\n`,
  });
}

function indexPage(publishedSlugs) {
  // List every tracked park. Parks without a cached NPS description have no
  // detail page yet, so they appear as plain entries rather than dead links.
  const byRegion = {};
  for (const p of PARKS) (byRegion[p.region] ||= []).push(p);

  const entry = (p) => {
    const inner = `<strong>${esc(p.name)}</strong><span>${esc(p.state)} &middot; ${p.established}</span>`;
    return publishedSlugs.has(p.slug)
      ? `<li><a href="/parks/${p.slug}/">${inner}</a></li>`
      : `<li><span class="no-guide">${inner}</span></li>`;
  };

  const body = `
<header class="hero">
  <div class="wrap">
    <h1>All ${PARKS.length} US National Parks</h1>
    <p>Every national park with its location and year established &mdash; plus a one-tap way to check off the ones you've visited.</p>
  </div>
</header>

<div class="wrap">
  ${Object.entries(byRegion)
    .map(
      ([key, list]) => `<section>
    <h2>${REGIONS[key].icon} ${esc(REGIONS[key].name)} <span class="count">${list.length}</span></h2>
    <ul class="park-index">
      ${list.map(entry).join("\n      ")}
    </ul>
  </section>`
    )
    .join("\n  ")}

  <footer>
    ParkQuest &mdash; a free checklist, tracker and map for all 63 US National Parks.
    <br />Park information courtesy of the <a href="https://www.nps.gov/">National Park Service</a>.
  </footer>
</div>`;

  return shell({
    title: `All ${PARKS.length} US National Parks — Full List by Region | ParkQuest`,
    desc: `A complete list of all ${PARKS.length} US National Parks grouped by region, with state, year established, and a visit checklist for each park.`,
    canonical: `${ORIGIN}/parks/`,
    nav: "parks",
    body,
  });
}

// --- write -----------------------------------------------------------------
// Resolve which parks are publishable BEFORE rendering, so cross-links between
// pages can never point at a park that was skipped.
const published = PARKS.filter((p) => NPS[p.code] && NPS[p.code].description);
const skipped = PARKS.filter((p) => !published.includes(p)).map((p) => p.slug);
const publishedSlugs = new Set(published.map((p) => p.slug));

for (const p of published) {
  const dir = path.join(SITE, "parks", p.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), parkPage(p, publishedSlugs));
}

fs.mkdirSync(path.join(SITE, "parks"), { recursive: true });
fs.writeFileSync(path.join(SITE, "parks", "index.html"), indexPage(publishedSlugs));

// Tell the client which parks actually have a guide page, so the checklist
// never renders a link to a park that was skipped.
fs.writeFileSync(
  path.join(SITE, "guides.js"),
  `// AUTO-GENERATED by build.mjs — parks that have a /parks/<slug>/ page.\n` +
    `const PARK_GUIDES = ${JSON.stringify([...publishedSlugs])};\n`
);

// sitemap
const urls = [
  { loc: `${ORIGIN}/`, pri: "1.0" },
  { loc: `${ORIGIN}/tracker/`, pri: "0.9" },
  { loc: `${ORIGIN}/map/`, pri: "0.9" },
  { loc: `${ORIGIN}/counter/`, pri: "0.9" },
  { loc: `${ORIGIN}/passport/`, pri: "0.9" },
  { loc: `${ORIGIN}/parks/`, pri: "0.8" },
  ...published.map((p) => ({ loc: `${ORIGIN}/parks/${p.slug}/`, pri: "0.7" })),
];
fs.writeFileSync(
  path.join(SITE, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.pri}</priority></url>`).join("\n")}
</urlset>
`
);

console.log(`built ${published.length} park pages + index + sitemap (${urls.length} urls)`);
if (skipped.length) {
  console.log(`SKIPPED (no NPS data cached, not published): ${skipped.join(", ")}`);
  process.exitCode = 2;
}
