// Map view for ParkQuest — self-contained inline SVG (no tiles, no CDN).
// Uses US_MAP from usmap.js (d3-geo albersUsa projection, Alaska & Hawaii inset).
// Click a park marker to toggle visited status. Depends on PARKS (parks.js) and
// state / toggleVisit / render (app.js).
(function () {
  var built = false;
  var svgNS = "http://www.w3.org/2000/svg";

  function el(name, attrs) {
    var n = document.createElementNS(svgNS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }

  function buildMap() {
    if (built) return;
    var host = document.getElementById("map");
    if (!host || typeof US_MAP === "undefined") return;
    built = true;

    var svg = el("svg", {
      viewBox: "0 0 " + US_MAP.width + " " + US_MAP.height,
      class: "us-map",
      role: "img",
      "aria-label": "Map of US national parks",
    });

    // Landmass + state boundaries
    svg.appendChild(el("path", { d: US_MAP.nation, class: "us-land" }));
    var g = el("g", { class: "us-states" });
    US_MAP.states.forEach(function (d) {
      g.appendChild(el("path", { d: d }));
    });
    svg.appendChild(g);

    // Territory inset label (American Samoa / Virgin Islands sit outside the projection)
    var lbl = el("text", { x: 876, y: 578, class: "us-inset-label", "text-anchor": "middle" });
    lbl.textContent = "Territories";
    svg.appendChild(lbl);

    // Park markers
    var markers = el("g", { class: "us-pins" });
    PARKS.forEach(function (p) {
      var xy = US_MAP.points[p.slug];
      if (!xy) return;
      var grp = el("g", {
        class: "us-pin",
        "data-slug": p.slug,
        tabindex: "0",
        role: "button",
        transform: "translate(" + xy[0] + "," + xy[1] + ")",
      });
      // generous invisible hit area (touch-friendly on mobile)
      grp.appendChild(el("circle", { r: 14, class: "us-pin-hit" }));
      grp.appendChild(el("circle", { r: 7, class: "us-pin-dot" }));
      var t = el("title");
      t.textContent = p.name + " — " + p.state;
      grp.appendChild(t);
      markers.appendChild(grp);
    });
    svg.appendChild(markers);

    host.innerHTML = "";
    host.appendChild(svg);

    function activate(target) {
      var grp = target.closest(".us-pin");
      if (!grp) return;
      var slug = grp.getAttribute("data-slug");
      toggleVisit(slug);
      showMapInfo(slug);
    }
    host.addEventListener("click", function (e) { activate(e.target); });
    host.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); activate(e.target); }
    });

    updateMapMarkers();
  }

  function showMapInfo(slug) {
    var box = document.getElementById("map-info");
    if (!box) return;
    var p = PARKS.filter(function (x) { return x.slug === slug; })[0];
    if (!p) return;
    var visited = !!state.visited[p.slug];
    box.innerHTML =
      '<strong>' + p.name + '</strong> <span class="mi-state">' + p.state + '</span>' +
      '<span class="mi-status ' + (visited ? "yes" : "no") + '">' +
      (visited ? "Visited ✓" : "Not visited") + "</span>";
    box.classList.add("show");
  }

  // Keeps the map in sync when the list view (or anything else) changes state
  window.updateMapMarkers = function () {
    if (!built) return;
    PARKS.forEach(function (p) {
      var grp = document.querySelector('.us-pin[data-slug="' + p.slug + '"]');
      if (grp) grp.classList.toggle("visited", !!state.visited[p.slug]);
    });
  };

  function showMap() {
    document.getElementById("view-map").classList.add("active");
    document.getElementById("view-list").classList.remove("active");
    document.getElementById("view-map").setAttribute("aria-selected", "true");
    document.getElementById("view-list").setAttribute("aria-selected", "false");
    document.getElementById("park-grid").hidden = true;
    document.getElementById("list-toolbar").hidden = true;
    document.getElementById("map-view").hidden = false;
    buildMap();
  }

  function showList() {
    document.getElementById("view-list").classList.add("active");
    document.getElementById("view-map").classList.remove("active");
    document.getElementById("view-list").setAttribute("aria-selected", "true");
    document.getElementById("view-map").setAttribute("aria-selected", "false");
    document.getElementById("map-view").hidden = true;
    document.getElementById("park-grid").hidden = false;
    document.getElementById("list-toolbar").hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("view-map").addEventListener("click", showMap);
    document.getElementById("view-list").addEventListener("click", showList);
    if (location.hash === "#map" || document.body.dataset.defaultView === "map") showMap();
  });
})();
