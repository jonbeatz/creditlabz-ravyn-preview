# CreditLabz — Ravyn desk (v3 + cyan)

> The v3 command desk in the v2 cyan-dark palette. Cyan leads. Violet marks
> urgency, flags, and deadlines. The desk structure stays the v3 pass.

[![GitHub Pages](https://img.shields.io/badge/github%20pages-live-2ee6ff)](https://jonbeatz.github.io/creditlabz-ravyn-preview/)
[![Branch](https://img.shields.io/badge/branch-main-2ee6ff)](https://github.com/jonbeatz/creditlabz-ravyn-preview/tree/main)
[![Last commit](https://img.shields.io/github/last-commit/jonbeatz/creditlabz-ravyn-preview/main)](https://github.com/jonbeatz/creditlabz-ravyn-preview/commits/main)
![Static site](https://img.shields.io/badge/site-static%20html-93a0ab)

**Compare gallery:** https://jonbeatz.github.io/creditlabz-ravyn-preview/

**This desk on the gallery:** https://jonbeatz.github.io/creditlabz-ravyn-preview/main/ and https://jonbeatz.github.io/creditlabz-ravyn-preview/v3-next-pass/

GitHub Pages builds from **`previews`**, which is the compare gallery. This file is the published desk on `main`. The color pass landed from `preview/creditlabz-v3-cyan`. `/v2-cyan-dark/` on the gallery keeps the older cyan layout so the two can be compared. `/v1/` is gone.

![CreditLabz cyan desk](assets/screenshot.png)

> **Prototype data only.** Every balance, renewal date, usage bar, and
> connection is invented. No credentials are stored or sent from this page.

## What's inside

- **Live API balance cards** — fal.ai, OpenRouter, and DeepSeek. Each card
  draws mini usage bars (cool slate for earlier days, glowing cyan for the latest)
  and a sample delta versus the 12-day average: fal.ai ▲$2.40, OpenRouter
  ▲$0.95, DeepSeek ▲$1.80.
- **7-day usage panel** — the same sample window, last seven days combined.
- **Manual accounts** — Higgsfield API, Higgsfield Starter ($19/mo), Cursor
  ($60/mo, renews October 11, 2026), Codex ($20/mo), Muse (Trinity) (Power
  plan, 36% used, 315M tokens left, resets September 28, 2026), and GrokBot
  (Ravyn).
- **GrokBot (Ravyn)** — a manual account. Weekly usage 3%, resets October 2,
  2026. On-demand $8.09 / $2, shown over limit in violet, resets October 11,
  2026. She appears in Connections, the configure dialog, the manual list,
  and the sanitized export. Her monogram uses the same lead cyan as the desk.
- **Configured connections** — 0/9. None of the sample slots are authenticated.
- **Higgsfield cashback** — use or lose, closes September 30, 2026. The desk
  prints that calendar date in violet. It does not count down in days.
- **Desk shell** — sticky Overview / Connections / Build plan tabs, a
  four-metric strip, monograms, a configure/edit dialog, an access-model
  panel, and one global DEMO banner.
- **Dummy ledger** — `data/balances.json` drives the page. `prototype` stays
  `true`. Export setup downloads a sanitized JSON file with no credential
  fields.

## Design language

Near-black field `#07080a`, cyan atmosphere, and glass panels. Corners stay
about 4px. **Cyan** `#2ee6ff` leads: the wordmark tick, configure button,
latest usage bar, selected tab, and selection (cyan on `#041014`). **Violet**
`#cbb6ff` is urgency: over-limit amounts, use-or-lose, and deadline dates.
Figures are `#f4f8fb`. There is no red lead and no gold micro accent.

**Manrope** carries the UI. **IBM Plex Mono** carries figures, eyebrows, and
labels. The header mark is the gray umbrella Z.

## Tech stack

| Layer   | Choice                                                                 |
| ------- | ---------------------------------------------------------------------- |
| Markup  | Static `index.html` + `css/` + `js/`                                  |
| Data    | `data/balances.json` (dummy only, clearly labeled)                    |
| Type    | Manrope + IBM Plex Mono                                                |
| Runtime | None — a local static server or GitHub Pages                           |
| Hosting | GitHub Pages (`.nojekyll`) from `previews`; this desk is `main`       |

## Project structure

```text
creditlabz-ravyn-preview/
├── index.html
├── css/styles.css
├── js/app.js
├── data/balances.json
├── assets/
│   ├── logo.png
│   └── screenshot.png
├── .nojekyll
└── README.md
```

## Open locally

```bash
python3 -m http.server 4173
```

Visit http://127.0.0.1:4173/ — a local server is required so the JSON ledger loads.

## Workflow

The cyan palette is on `main`. The compare gallery on `previews` shows this
desk at `/main/` and `/v3-next-pass/`, and the older layout at `/v2-cyan-dark/`.
Any UI change also replaces `assets/screenshot.png` in the same commit, so the
README hero matches the current dark desk.
