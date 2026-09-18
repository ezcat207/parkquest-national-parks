// ParkQuest MVP — vanilla JS, no build step, no backend. State lives in localStorage.
const STORAGE_KEY = "parkquest.v1";

const MILESTONES = [
  { id: "first-checkin", label: "First Steps", desc: "Check in your first park", threshold: 1, icon: "🥾" },
  { id: "collector-5", label: "Collector", desc: "Visit 5 parks", threshold: 5, icon: "🎒" },
  { id: "explorer-10", label: "Explorer", desc: "Visit 10 parks", threshold: 10, icon: "🧭" },
  { id: "master-25", label: "Park Master", desc: "Visit 25 parks", threshold: 25, icon: "🏕️" },
  { id: "grandmaster-50", label: "Grandmaster", desc: "Visit 50 parks", threshold: 50, icon: "🏆" },
  { id: "all-63", label: "63 Grand Slam", desc: "Visit all 63 national parks", threshold: 63, icon: "👑" },
];

const STREAK_BADGES = [
  { id: "streak-3", label: "3-Day Streak", threshold: 3, icon: "🔥" },
  { id: "streak-7", label: "7-Day Streak", threshold: 7, icon: "🔥" },
  { id: "streak-30", label: "30-Day Streak", threshold: 30, icon: "🔥" },
];

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw);
    return {
      visited: parsed.visited || {},
      achievements: parsed.achievements || [],
      streak: parsed.streak || { current: 0, best: 0, lastActionDate: null },
    };
  } catch (e) {
    return { visited: {}, achievements: [], streak: { current: 0, best: 0, lastActionDate: null } };
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  const d1 = new Date(a + "T00:00:00");
  const d2 = new Date(b + "T00:00:00");
  return Math.round((d2 - d1) / 86400000);
}

function bumpStreak() {
  const today = todayStr();
  const last = state.streak.lastActionDate;
  if (last === today) {
    // already counted today, no-op
  } else if (last && daysBetween(last, today) === 1) {
    state.streak.current += 1;
  } else {
    state.streak.current = 1;
  }
  state.streak.best = Math.max(state.streak.best, state.streak.current);
  state.streak.lastActionDate = today;
}

function toggleVisit(slug) {
  if (state.visited[slug]) {
    delete state.visited[slug];
  } else {
    state.visited[slug] = todayStr();
    bumpStreak();
  }
  checkAchievements();
  saveState();
  render();
}

function setVisitDate(slug, dateStr) {
  if (state.visited[slug] !== undefined) {
    state.visited[slug] = dateStr;
    saveState();
    render();
  }
}

function visitedCount() {
  return Object.keys(state.visited).length;
}

// PARK_GUIDES is emitted by build.mjs (guides.js). If it hasn't loaded, assume
// no guide exists rather than linking to a page that may 404.
function hasGuide(slug) {
  return typeof PARK_GUIDES !== "undefined" && PARK_GUIDES.indexOf(slug) !== -1;
}

function regionStats() {
  const stats = {};
  for (const key of Object.keys(REGIONS)) stats[key] = { total: 0, visited: 0 };
  for (const p of PARKS) {
    stats[p.region].total += 1;
    if (state.visited[p.slug]) stats[p.region].visited += 1;
  }
  return stats;
}

function checkAchievements() {
  const count = visitedCount();
  const newly = [];
  for (const m of MILESTONES) {
    if (count >= m.threshold && !state.achievements.includes(m.id)) {
      state.achievements.push(m.id);
      newly.push(m);
    }
  }
  for (const s of STREAK_BADGES) {
    if (state.streak.best >= s.threshold && !state.achievements.includes(s.id)) {
      state.achievements.push(s.id);
      newly.push(s);
    }
  }
  const stats = regionStats();
  for (const key of Object.keys(REGIONS)) {
    const id = "region-" + key;
    if (stats[key].total > 0 && stats[key].visited === stats[key].total && !state.achievements.includes(id)) {
      state.achievements.push(id);
      newly.push({ id, label: REGIONS[key].name + " Complete", icon: REGIONS[key].icon });
    }
  }
  if (newly.length) showToast(newly);
}

function showToast(newly) {
  const el = document.getElementById("toast");
  el.innerHTML = newly.map(m => `<div class="toast-item">${m.icon || "🏅"} Achievement unlocked: <strong>${m.label}</strong></div>`).join("");
  el.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => el.classList.remove("show"), 3500);
}

function nextSuggestion() {
  const unvisited = PARKS.filter(p => !state.visited[p.slug]);
  if (!unvisited.length) return null;
  // Prefer a region the user has already started but not finished, else random
  const stats = regionStats();
  const inProgress = Object.keys(stats).filter(k => stats[k].visited > 0 && stats[k].visited < stats[k].total);
  const pool = inProgress.length
    ? unvisited.filter(p => inProgress.includes(p.region))
    : unvisited;
  return pool[Math.floor(Math.random() * pool.length)];
}

function render() {
  renderProgress();
  renderRegions();
  renderAchievements();
  renderSuggestion();
  renderGrid();
  if (typeof window.updateMapMarkers === "function") window.updateMapMarkers();
}

function renderProgress() {
  const count = visitedCount();
  const pct = Math.round((count / PARKS.length) * 100);
  document.getElementById("progress-count").textContent = `${count} / ${PARKS.length}`;
  document.getElementById("progress-pct").textContent = `${pct}%`;
  document.getElementById("progress-bar-fill").style.width = pct + "%";
  document.getElementById("streak-current").textContent = state.streak.current;
  document.getElementById("streak-best").textContent = state.streak.best;
}

function renderRegions() {
  const stats = regionStats();
  const container = document.getElementById("region-stats");
  container.innerHTML = Object.entries(REGIONS).map(([key, r]) => {
    const s = stats[key];
    const pct = s.total ? Math.round((s.visited / s.total) * 100) : 0;
    const done = s.visited === s.total;
    return `<div class="region-chip ${done ? "done" : ""}">
      <span class="region-icon">${r.icon}</span>
      <span class="region-name">${r.name}</span>
      <span class="region-count">${s.visited}/${s.total}</span>
      <div class="region-bar"><div class="region-bar-fill" style="width:${pct}%"></div></div>
    </div>`;
  }).join("");
}

function renderAchievements() {
  const all = [...MILESTONES, ...STREAK_BADGES, ...Object.entries(REGIONS).map(([key, r]) => ({ id: "region-" + key, label: r.name + " Complete", icon: r.icon }))];
  const container = document.getElementById("achievements");
  container.innerHTML = all.map(a => {
    const unlocked = state.achievements.includes(a.id);
    return `<div class="badge ${unlocked ? "unlocked" : "locked"}" title="${a.desc || a.label}">
      <span class="badge-icon">${a.icon || "🏅"}</span>
      <span class="badge-label">${a.label}</span>
    </div>`;
  }).join("");
}

function renderSuggestion() {
  const box = document.getElementById("suggestion");
  const next = nextSuggestion();
  if (!next) {
    box.innerHTML = `<strong>You've collected all 63 national parks. 👑</strong>`;
    return;
  }
  box.innerHTML = `Next stop suggestion: <strong>${next.name}</strong> (${next.state}) — ${next.blurb}`;
}

function renderGrid() {
  const container = document.getElementById("park-grid");
  const query = (document.getElementById("search").value || "").toLowerCase();
  const regionFilter = document.getElementById("region-filter").value;
  const visitedFilter = document.getElementById("visited-filter").value;

  const filtered = PARKS.filter(p => {
    if (query && !(p.name.toLowerCase().includes(query) || p.state.toLowerCase().includes(query))) return false;
    if (regionFilter !== "all" && p.region !== regionFilter) return false;
    const isVisited = !!state.visited[p.slug];
    if (visitedFilter === "visited" && !isVisited) return false;
    if (visitedFilter === "unvisited" && isVisited) return false;
    return true;
  });

  container.innerHTML = filtered.map(p => {
    const isVisited = state.visited[p.slug];
    return `<div class="park-card ${isVisited ? "visited" : ""}" data-slug="${p.slug}">
      <div class="stamp" aria-hidden="true">✓</div>
      <div class="park-icon">${REGIONS[p.region].icon}</div>
      <h3 class="park-name">${p.name}</h3>
      <div class="park-meta">${p.state} · est. ${p.established}</div>
      <p class="park-blurb">${p.blurb}</p>
      <div class="park-actions">
        <button class="btn-toggle" data-slug="${p.slug}">${isVisited ? "Visited ✓" : "Mark as visited"}</button>
        ${isVisited ? `<input type="date" class="visit-date" data-slug="${p.slug}" value="${isVisited}" />` : ""}
        ${hasGuide(p.slug) ? `<a class="park-link" href="/parks/${p.slug}/">Park guide &rarr;</a>` : ""}
      </div>
    </div>`;
  }).join("") || `<p class="empty">No parks match your filters.</p>`;

  container.querySelectorAll(".btn-toggle").forEach(btn => {
    btn.addEventListener("click", () => toggleVisit(btn.dataset.slug));
  });
  container.querySelectorAll(".visit-date").forEach(input => {
    input.addEventListener("change", () => setVisitDate(input.dataset.slug, input.value));
  });
}

function init() {
  document.getElementById("search").addEventListener("input", renderGrid);
  document.getElementById("region-filter").addEventListener("change", renderGrid);
  document.getElementById("visited-filter").addEventListener("change", renderGrid);

  const regionSelect = document.getElementById("region-filter");
  regionSelect.innerHTML = `<option value="all">All regions</option>` +
    Object.entries(REGIONS).map(([key, r]) => `<option value="${key}">${r.icon} ${r.name}</option>`).join("");

  render();
}

document.addEventListener("DOMContentLoaded", init);
