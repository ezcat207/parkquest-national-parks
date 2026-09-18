// Check-in button for single-park detail pages. Reads/writes the SAME
// localStorage record as the main checklist (app.js) so a park marked here
// shows up as visited on /, /map/, /tracker/ etc.
(function () {
  var STORAGE_KEY = "parkquest.v1";

  function load() {
    try {
      var s = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return {
        visited: s.visited || {},
        achievements: s.achievements || [],
        streak: s.streak || { current: 0, best: 0, lastActionDate: null },
      };
    } catch (e) {
      return { visited: {}, achievements: [], streak: { current: 0, best: 0, lastActionDate: null } };
    }
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function daysBetween(a, b) {
    return Math.round((new Date(b + "T00:00:00") - new Date(a + "T00:00:00")) / 86400000);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("checkin-btn");
    if (!btn) return;
    var slug = btn.dataset.slug;
    var sub = document.getElementById("checkin-sub");
    var state = load();

    function paint() {
      var date = state.visited[slug];
      if (date) {
        btn.textContent = "Visited ✓";
        btn.classList.add("is-visited");
        sub.textContent = "Marked visited on " + date + ". Tap again to undo.";
      } else {
        btn.textContent = "Mark as visited";
        btn.classList.remove("is-visited");
        sub.textContent = "Your answer is saved in this browser and syncs with your checklist.";
      }
    }

    btn.addEventListener("click", function () {
      if (state.visited[slug]) {
        delete state.visited[slug];
      } else {
        state.visited[slug] = today();
        // mirror app.js streak rules so the two entry points stay consistent
        var last = state.streak.lastActionDate;
        if (last !== today()) {
          state.streak.current = last && daysBetween(last, today()) === 1 ? state.streak.current + 1 : 1;
          state.streak.best = Math.max(state.streak.best, state.streak.current);
          state.streak.lastActionDate = today();
        }
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      paint();
    });

    paint();
  });
})();
