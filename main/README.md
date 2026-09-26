# ⚡ CreditLabz — Ravyn Preview

> Ravyn's design entry for Jon's **CreditLabz** bake-off — a private credit
> desk for API balances and AI subscriptions, glass over charcoal.

[![GitHub Pages](https://img.shields.io/badge/github%20pages-live-success)](https://jonbeatz.github.io/creditlabz-ravyn-preview/)
[![Last commit](https://img.shields.io/github/last-commit/jonbeatz/creditlabz-ravyn-preview)](https://github.com/jonbeatz/creditlabz-ravyn-preview/commits/main)
[![Repo size](https://img.shields.io/github/repo-size/jonbeatz/creditlabz-ravyn-preview)](https://github.com/jonbeatz/creditlabz-ravyn-preview)
![Static site](https://img.shields.io/badge/site-static%20html-blue)

**🚀 Live preview:** https://jonbeatz.github.io/creditlabz-ravyn-preview/

![CreditLabz preview](assets/screenshot.png)

> **Prototype data only.** Every balance, renewal, sparkline, and deadline is
> invented. No credentials are stored or sent from this page.

## What's inside

- **Live API balance cards** — fal.ai, OpenRouter, DeepSeek. Mocked for now;
  planned for authenticated server-side pulls behind the private REST API.
- **Manual account cards** — Higgsfield API, Higgsfield Starter ($19/mo),
  Cursor ($60/mo), Codex ($20/mo), Muse. For services with no public balance
  endpoint.
- **Higgsfield cashback flag** — the Sept 30 use-or-lose promo deadline stays
  visible.
- **Dummy ledger JSON** — `data/balances.json` drives the page; `prototype`
  must stay `true`.

## Design language

Glassmorphic frosted-glass cards, small tight radius corners, no colored
strokes. Dark charcoal + grays with red and gold accents — no teal, aqua,
or purple. Jon's locked website taste.

## Tech stack

| Layer   | Choice                                                         |
| ------- | -------------------------------------------------------------- |
| Markup  | Static `index.html` + `css/` + `js/`                            |
| Data    | `data/balances.json` (dummy only, clearly labeled)             |
| Runtime | None — opens via a local static server or GitHub Pages         |
| Hosting | GitHub Pages, served from `main` (`.nojekyll`, no Jekyll pass) |

## Project structure

```text
creditlabz-ravyn-preview/
├── index.html
├── css/styles.css
├── js/app.js
├── data/balances.json
├── assets/
│   └── screenshot.png   # README hero shot (dark mode)
├── favicon.svg
├── .nojekyll
└── README.md
```

## Open locally

```bash
python3 -m http.server 4173
```

Visit http://127.0.0.1:4173/ — a local server is required so the JSON ledger loads.

## Workflow — branches, not overwrites

`main` always mirrors the latest approved build. Every change gets cut as a
**new branch** off `main` and previewed before it lands. Nothing is silently
replaced. No PRs unless Jon asks.

## Use this repo as a template

House pattern for Jon's preview repos: badges → live link → hero screenshot →
what's inside → design language → tech stack → structure → workflow.
