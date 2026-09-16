// Shared interactive sections for ParkQuest, injected into #app-root so every
// SEO landing variant (/, /tracker, /map, /counter, /passport) reuses one source
// of truth for the tool while keeping its own static hero/intro copy for SEO.
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
      '</nav>',

      '<div class="progress-panel">',
      '  <div>',
      '    <div class="progress-headline">',
      '      <span id="progress-count">0 / 63</span>',
      '      <span id="progress-pct">0%</span>',
      '      <span style="color: var(--text-muted); font-size: 13px;">national parks visited</span>',
      '    </div>',
      '    <div class="progress-bar"><div class="progress-bar-fill" id="progress-bar-fill"></div></div>',
      '  </div>',
      '  <div class="streak-box">',
      '    Current streak: <strong id="streak-current">0</strong> days',
      '    <div>Best streak: <span id="streak-best">0</span> days</div>',
      '  </div>',
      '</div>',

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

      '<section>',
      '  <div class="section-head">',
      '    <h2>Your national park checklist</h2>',
      '    <div class="view-toggle" role="tablist">',
      '      <button id="view-list" class="view-btn active" role="tab" aria-selected="true">List</button>',
      '      <button id="view-map" class="view-btn" role="tab" aria-selected="false">Map</button>',
      '    </div>',
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
      '  <div id="map-view" hidden>',
      '    <p class="map-hint">Click any pin to toggle whether you\'ve visited that park. Green pins are collected.</p>',
      '    <div id="map"></div>',
      '  </div>',
      '</section>',

      '<div id="toast"></div>',
    ].join("\n");

    // Highlight the current page in the nav
    var current = document.body.dataset.nav || "home";
    var link = root.querySelector('.pq-nav a[data-nav="' + current + '"]');
    if (link) link.classList.add("active");
  });
})();
