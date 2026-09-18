// Shared interactive sections for ParkQuest, injected into #app-root so every
// SEO landing variant (/, /tracker, /map, /counter, /passport) reuses one source
// of truth for the tool while keeping its own static hero/intro copy for SEO.
//
// Order matters: progress -> the tool itself (map/list) -> secondary stats.
// The tool is the point of the page, so it must sit above the fold-ish on mobile
// rather than below region stats/achievements.
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var root = document.getElementById("app-root");
    if (!root) return;
    root.innerHTML = [
      '<nav class="pq-nav">',
      '  <a href="/" data-nav="home">Checklist</a>',
      '  <a href="/tracker/" data-nav="tracker">Tracker</a>',
      '  <a href="/map/" data-nav="map">Map</a>',
      '  <a href="/counter/" data-nav="counter">Counter</a>',
      '  <a href="/passport/" data-nav="passport">Passport</a>',
      '  <a href="/parks/" data-nav="parks">All parks</a>',
      '</nav>',

      '<div class="progress-panel">',
      '  <div>',
      '    <div class="progress-headline">',
      '      <span id="progress-count">0 / 63</span>',
      '      <span id="progress-pct">0%</span>',
      '      <span class="progress-label">national parks visited</span>',
      '    </div>',
      '    <div class="progress-bar"><div class="progress-bar-fill" id="progress-bar-fill"></div></div>',
      '  </div>',
      '  <div class="streak-box">',
      '    <span class="streak-label">Current streak</span>',
      '    <strong id="streak-current">0</strong>',
      '    <span class="streak-best">Best: <span id="streak-best">0</span> days</span>',
      '  </div>',
      '</div>',

      '<section>',
      '  <div class="section-head">',
      '    <h2>Your national park checklist</h2>',
      '    <div class="view-toggle" role="tablist">',
      '      <button id="view-list" class="view-btn active" role="tab" aria-selected="true">List</button>',
      '      <button id="view-map" class="view-btn" role="tab" aria-selected="false">Map</button>',
      '    </div>',
      '  </div>',
      '  <div id="map-view" hidden>',
      '    <p class="map-hint">Tap any park on the map to check it off. Green dots are the ones you\'ve collected.</p>',
      '    <div id="map"></div>',
      '    <div id="map-info"></div>',
      '  </div>',
      '  <div class="toolbar" id="list-toolbar">',
      '    <input type="text" id="search" placeholder="Search by park name or state&hellip;" />',
      '    <select id="region-filter"></select>',
      '    <select id="visited-filter">',
      '      <option value="all">All parks</option>',
      '      <option value="visited">Visited only</option>',
      '      <option value="unvisited">Not visited yet</option>',
      '    </select>',
      '  </div>',
      '  <div class="park-grid" id="park-grid"></div>',
      '</section>',

      '<section>',
      '  <h2>Progress by region</h2>',
      '  <div class="region-stats" id="region-stats"></div>',
      '</section>',

      '<section>',
      '  <h2>Suggested next park</h2>',
      '  <div class="suggestion" id="suggestion"></div>',
      '</section>',

      '<section>',
      '  <h2>Achievements</h2>',
      '  <div class="achievements" id="achievements"></div>',
      '</section>',

      '<div id="toast"></div>',
    ].join("\n");

    // Highlight the current page in the nav
    var current = document.body.dataset.nav || "home";
    var link = root.querySelector('.pq-nav a[data-nav="' + current + '"]');
    if (link) link.classList.add("active");
  });
})();
