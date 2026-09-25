# CreditLabz

Ravyn bake-off prototype of a private API credit desk. **Dummy data only.**

**PROTOTYPE / FAKE DATA.** `data/balances.json` is invented. This page does not call fal.ai, OpenRouter, DeepSeek, Higgsfield, Cursor, OpenAI, or any other provider. There are no API keys and no secrets in this repo.

The banner and the footer both say **PROTOTYPE / FAKE DATA**.

## Open locally

From the repository root:

```bash
python3 -m http.server 4173
```

Visit [http://127.0.0.1:4173/](http://127.0.0.1:4173/).

A local server is required. Opening `index.html` as a file will not load the JSON ledger.

Edit `data/balances.json` and refresh to change the fake figures. The page will not render the ledger if `prototype` is not `true`.

## Pages

GitHub Pages serves branch `preview/creditlabz-v1`:

https://jonbeatz.github.io/creditlabz-ravyn-preview/
