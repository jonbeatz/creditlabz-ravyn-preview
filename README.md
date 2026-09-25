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

## GitHub Pages

Branch: [`preview/creditlabz-v1`](https://github.com/jonbeatz/creditlabz-ravyn-preview/tree/preview/creditlabz-v1)

Site URL, once Pages is on: https://jonbeatz.github.io/creditlabz-ravyn-preview/

The prototype is a static site at the repository root. `.github/workflows/pages.yml` publishes that branch with GitHub Actions.

Creating the Pages site needs repository administration. The token available in this environment cannot do that (`403 Resource not accessible by integration`), so the workflow cannot finish until a repo admin sets the source:

1. Open **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Re-run **Publish CreditLabz prototype** on `preview/creditlabz-v1`.

After that, pushes to this branch publish the fake ledger.
