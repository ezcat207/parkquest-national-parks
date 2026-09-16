# ParkQuest — National Parks Checklist & Tracker

A free, gamified checklist and tracker for all 63 US National Parks: mark parks as visited, watch your progress by region, and unlock achievements (collection milestones, region completions, and check-in streaks). No account required — progress is saved locally in your browser.

This is a "one week one project" build. Planning docs:
- [`hypotheses.md`](./hypotheses.md) — success hypotheses and factual judgments distilled from competitor/keyword research
- [`design.md`](./design.md) — product & technical design for the MVP
- [`reference/full_gefei.md`](./reference/full_gefei.md) — source research

## Site

Static site, no build step: [`site/`](./site) — `index.html` + `style.css` + `parks.js` (data) + `app.js` (logic). Deployed to Cloudflare Pages.

## Local dev

```bash
cd site
python3 -m http.server 8080
```

Then open http://localhost:8080
