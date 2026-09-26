# ⚡ CreditLabz — Ravyn Preview (v2 cyan-dark)

> Cyan-dark alternate for Jon's **CreditLabz** bake-off. This branch is the
> v2 direction: near-black charcoal with clear cyan accents. **`main` keeps
> the gold direction.**

[![GitHub Pages](https://img.shields.io/badge/github%20pages-serves%20main-lightgrey)](https://jonbeatz.github.io/creditlabz-ravyn-preview/)
[![Branch](https://img.shields.io/badge/branch-preview%2Fcreditlabz--v2--cyan--dark-2ee6ff)](https://github.com/jonbeatz/creditlabz-ravyn-preview/tree/preview/creditlabz-v2-cyan-dark)
[![Last commit](https://img.shields.io/github/last-commit/jonbeatz/creditlabz-ravyn-preview/preview/creditlabz-v2-cyan-dark)](https://github.com/jonbeatz/creditlabz-ravyn-preview/commits/preview/creditlabz-v2-cyan-dark)
![Static site](https://img.shields.io/badge/site-static%20html-blue)

**🚀 Published Pages:** https://jonbeatz.github.io/creditlabz-ravyn-preview/

Live GitHub Pages is served from **`main`**, so that URL can still show the
gold build. This cyan-dark alternate lives on
`preview/creditlabz-v2-cyan-dark` until Pages is pointed here.

![CreditLabz cyan-dark preview](assets/screenshot.png)

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

This branch is the **cyan-dark alternate (v2)**. `main` keeps gold.

Near-black charcoal field, glass cards that stay dark, tight 3px corners.
Clear cyan (`#2ee6ff`) for accents: the mark, section indexes, live badges,
upward traces, and focus. Urgency, deadlines, and downward traces use a soft
purple (`#cbb6ff`) so flags still read as flags. No gold, no red or salmon,
no teal or aqua wash.

Type is one paired system: **IBM Plex Sans** for titles, labels, and body;
**IBM Plex Mono** for balances and countdown figures. Tabular, dashboard-tech
numbers. No display serif.

## Tech stack

| Layer   | Choice                                                         |
| ------- | -------------------------------------------------------------- |
| Markup  | Static `index.html` + `css/` + `js/`                            |
| Data    | `data/balances.json` (dummy only, clearly labeled)             |
| Type    | IBM Plex Sans + IBM Plex Mono                                  |
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
│   └── screenshot.png   # README hero shot (cyan-dark)
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

`main` always mirrors the latest approved build (gold, for now). Every change
gets cut as a **new branch** off `main` and previewed before it lands. This
file is the v2 cyan-dark branch. Nothing is silently replaced. No PRs unless
Jon asks.

Any UI change on this branch also replaces `assets/screenshot.png` in the
same commit. The README hero has to show the current cyan-dark build, not a
stale gold or earlier shot.

## Use this repo as a template

House pattern for Jon's preview repos: badges → live link → hero screenshot →
what's inside → design language → tech stack → structure → workflow.
