# SuperFam Weight Challenge 🏆

A family weight-loss challenge tracker — leaderboard, phase scoring, race view, and a monthly weigh-in log. Runs entirely in the browser with no build step.

## Features

- **Points leaderboard** — ranked by total score across both phases
- **Phase 1 – The Race** — earn points for every percent of your weight-loss goal completed; monthly rank bonuses (🥇/🥈/🥉)
- **Phase 2 – The Hold** — once goal is reached, earn points each month you maintain it; streak milestone bonuses at 3/6/12 months
- **Race view** — animated sprite-sheet animals race along a track; sprite changes as they slim down
- **Charts** — weight over time, % progress, and cumulative points (Chart.js)
- **Weigh-in history** — full monthly log table with gain/goal tags
- **Dev Console** — inject weigh-ins, export `data.json`, reset, or load 8-month test data

## Running Locally

Serve the folder over HTTP (required for `data.json` to load via `fetch`):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Project Structure

```
superfam_weighttrack/
├── index.html        # HTML shell — structure only, no inline CSS or JS
├── style.css         # All styles
├── js/
│   ├── config.js     # Scoring constants (SC), RACERS, ANIMAL_QUOTES
│   ├── utils.js      # Shared utility functions (fmt, dates, weights, etc.)
│   ├── scoring.js    # computeScores() — Phase 1/2 engine + monthly rankings
│   ├── render.js     # Leaderboard, phase cards, score breakdown, chart, history
│   ├── race.js       # Race view rendering + view-switcher
│   ├── dev.js        # Dev console (inject, export, reset, test data)
│   └── main.js       # Global state, countdown, rerender(), bootstrap
├── data.json         # Participant data + weigh-in entries (source of truth)
├── animals.png       # Sprite sheet — 3 cols (fat/medium/lean) × 3 rows (animals)
└── .gitignore
```

## Updating Weigh-Ins

On the 1st of each month, either:
- Use the Dev Console in-browser → inject → export `data.json` → commit, or
- Edit `data.json` directly and add an entry to the participant's `entries` array:

```json
{ "date": "2026-06-01", "weight": 88.5 }
```

Then commit and push — the hosted site updates automatically.

## Participants

| Name | Start  | Goal  | Color   |
|------|--------|-------|---------|
| SC   | 90 kg  | 75 kg | #6366f1 |
| JC   | 95 kg  | 80 kg | #ec4899 |
| CHC  | 95 kg  | 85 kg | #10b981 |

**Deadline:** November 1, 2027

## Scoring Rules

| Event | Points |
|---|---|
| Phase 1: kg lost | 1 pt per 1% of goal completed |
| Monthly rank | 🥇 +20 / 🥈 +10 / 🥉 +5 (Phase 1 only) |
| Goal hit bonus | 50–100 pts (more points for hitting early) |
| Phase 2: monthly hold | +30 pts per month at/below goal |
| Hold streak | +25 at 3 months · +60 at 6 months · +120 at 12 months |

## Sprite Sheet (`animals.png`)

3×3 grid used by the race view:
- **Columns**: fat (0–33% progress) · medium (33–66%) · lean (66–100%)
- **Rows**: chicken (SC) · horse (JC) · dragon (CHC)
- Tile size: 200×160 px, `background-size: 300% 300%`, flipped with `scaleX(-1)`

## Hosting

Push the repo root; set Pages/CI source to `/ (root)` on `main`. No build step needed.
