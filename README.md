# GunSound Quiz 🎯🔫

**Train your ears to identify firearms by sound — 枪声盲听辨别训练工具**

A fully front-end, deployable web app for training your ear to distinguish different firearms by their report. Play a gunshot → guess the caliber → score points.

## Demo

```bash
cd gunshot-quiz
python3 -m http.server 8080
# Open http://localhost:8080
```

## Features

- 🎯 **Blind Quiz** — Hear a shot, pick from 4 options, score points
- 🔄 **A/B Compare** — Switch between two sounds to learn the difference
- 📖 **Learn Mode** — Listen and read characteristic descriptions for each caliber
- 📊 **Stats** — Accuracy tracking + confusion matrix (which guns you always mix up)
- ⏱ **Timer** — Optional per-question timer (10-120s)
- ⌨️ **Keyboard shortcuts** — Space to play, 1-4 to answer
- 👥 **Multi-player** — Local leaderboard for multiple players
- 📥 **CSV Export** — Export your scores
- 🌐 **i18n** — Chinese + English UI
- 📱 **Responsive** — Works on mobile
- 🎨 **Dark military theme**

## Calibers Included (14 total)

| Category | Calibers |
|----------|----------|
| 🔫 Pistols | 9mm (Glock 17), .45 ACP (M1911), .357 Magnum (Revolver), .22 LR |
| 🔫 Rifles | 5.56×45 (M4), 7.62×39 (AK-47), 7.62×51/.308 (M14), 5.45×39 (AK-74) |
| 🔫 SMGs | 9mm (MP5), .45 ACP (UMP45/Thompson) |
| 🔫 Shotguns | 12 Gauge Pump, 12 Gauge Semi-Auto |
| 🔫 Special | .50 BMG (M82), 7.62×54R (PKM) |

## Sound Files

**Currently: synthetically generated** using mathematical audio synthesis (Python). Each caliber has a distinct frequency profile:
- 5.56mm → sharp high-frequency crack ( ~1100Hz center)
- 7.62x39mm → deep low boom (~400Hz center)
- .45 ACP → heavy subsonic thud (~300Hz center)
- .50 BMG → thunderous low rumble (~150Hz center)

To upgrade to real recordings, replace the `.wav` files in `/sounds/` with real CC0-licensed gunshot samples and update `data/sounds.json`.

## Tech Stack

HTML + CSS + JavaScript (vanilla) · Zero dependencies · Deploy to GitHub Pages / Netlify / Vercel

## Project Origin

Idea sparked during a conversation with JARVIS, my AI butler. Built for fun by a 15-year-old military/tech enthusiast. If you're into firearms and tactical knowledge, feel free to join.

---

*Made by Tintin Zhang · 2026 Summer*
