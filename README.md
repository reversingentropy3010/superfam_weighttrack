# ⚖️ Weight Loss Challenge Tracker

A GitHub Pages site that tracks monthly weight progress for CC, JC, and CHC towards their goals.

## 📁 Files

| File | Purpose |
|------|---------|
| `index.html` | Full UI — no build step needed |
| `data.json` | **Edit this monthly** to add new weigh-in entries |

## 🗓️ How to update (every 1st of the month)

1. Open `data.json`
2. For each participant, add a new entry to their `"entries"` array:

```json
{ "date": "2026-06-01", "weight": 88.5 }
```

3. Commit and push — GitHub Pages updates automatically.

## 👥 Participants

| Name | Start | Goal |
|------|-------|------|
| CC   | 90 kg | 75 kg |
| JC   | 95 kg | 80 kg |
| CHC  | 95 kg | 85 kg |

**Deadline:** November 1, 2027 · **Weigh-in day:** 1st of each month

## 🚀 Setup GitHub Pages

1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch → `main` → `/ (root)`**
4. Your site will be live at `https://<username>.github.io/<repo-name>/`
