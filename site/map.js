// Map view for ParkQuest — Leaflet-based. Click a pin to toggle visited status.
// Depends on globals from parks.js (PARKS) and app.js (state, toggleVisit, render).
(function () {
  let map = null;
  let markers = {}; // slug -> L.CircleMarker
  let initialized = false;

  function markerStyle(visited) {
    return {
      radius: 7,
      weight: 2,
      color: visited ? "#2d5a3d" : "#8a8f86",
      fillColor: visited ? "#3f8f5f" : "#ffffff",
      fillOpacity: visited ? 0.95 : 0.85,
    };
  }

  function popupHtml(p) {
    const visited = !!state.visited[p.slug];
    return `<div class="map-popup">
      <strong>${p.name}</strong><br/>
      <span class="map-popup-meta">${p.state} · est. ${p.established}</span>
      <p class="map-popup-blurb">${p.blurb}</p>
      <button class="map-popup-btn" data-slug="${p.slug}">${visited ? "Visited ✓ — undo" : "Mark as visited"}</button>
    </div>`;
  }

  function wirePopupButton(p) {
    return function () {
      const btn = document.querySelector(`.map-popup-btn[data-slug="${p.slug}"]`);
      if (btn) {
        btn.addEventListener("click", function () {
          toggleVisit(p.slug); // updates state + calls render() -> updateMapMarkers()
          const mk = markers[p.slug];
          if (mk) mk.setPopupContent(popupHtml(p));
        });
      }
    };
  }

  function initMap() {
    if (initialized) return;
    initialized = true;

    map = L.map("map", { scrollWheelZoom: false, worldCopyJump: true }).setView([39.5, -98.35], 3);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      maxZoom: 10,
      subdomains: "abcd",
    }).addTo(map);

    for (const p of PARKS) {
      const visited = !!state.visited[p.slug];
      const mk = L.circleMarker([p.lat, p.lng], markerStyle(visited)).addTo(map);
      mk.bindPopup(popupHtml(p));
      mk.bindTooltip(p.name, { direction: "top", offset: [0, -6] });
      mk.on("popupopen", wirePopupButton(p));
      markers[p.slug] = mk;
    }
  }

  // Called from app.js render() so list <-> map stay in sync
  window.updateMapMarkers = function () {
    if (!initialized) return;
    for (const p of PARKS) {
      const mk = markers[p.slug];
      if (!mk) continue;
      const visited = !!state.visited[p.slug];
      mk.setStyle(markerStyle(visited));
      mk.setPopupContent(popupHtml(p));
    }
  };

  function showMap() {
    document.getElementById("view-map").classList.add("active");
    document.getElementById("view-list").classList.remove("active");
    document.getElementById("view-map").setAttribute("aria-selected", "true");
    document.getElementById("view-list").setAttribute("aria-selected", "false");
    document.getElementById("park-grid").hidden = true;
    document.getElementById("list-toolbar").style.display = "none";
    document.getElementById("map-view").hidden = false;
    initMap();
    // Leaflet needs a visible container to size tiles correctly
    setTimeout(function () { if (map) map.invalidateSize(); }, 50);
  }

  function showList() {
    document.getElementById("view-list").classList.add("active");
    document.getElementById("view-map").classList.remove("active");
    document.getElementById("view-list").setAttribute("aria-selected", "true");
    document.getElementById("view-map").setAttribute("aria-selected", "false");
    document.getElementById("map-view").hidden = true;
    document.getElementById("park-grid").hidden = false;
    document.getElementById("list-toolbar").style.display = "";
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("view-map").addEventListener("click", showMap);
    document.getElementById("view-list").addEventListener("click", showList);
    // If the page was requested with #map (used by the /map variant later), open map first
    if (location.hash === "#map" || document.body.dataset.defaultView === "map") {
      showMap();
    }
  });
})();
