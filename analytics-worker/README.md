# Portfolio GitHub Analytics backend

Private analytics backend for `/admin/github/`. A Cloudflare Worker collects GitHub data into D1, while GitHub Pages serves only the dashboard shell. The GitHub analytics token never reaches the browser.

## Daily collection

Every run discovers repositories owned by `rclevenger-hm` and keeps only public, non-fork, non-archived repositories. Two small cron shards each process half the current set, so every eligible repository is captured daily without relying on a hard-coded repo list.

Collected data includes stars, real notification watchers, forks, open issues/PRs, views, unique visitors, clones, unique cloners, referrers, popular paths, account followers, and new/removed stars/watchers/followers. GitHub traffic endpoints expose only the recent traffic window, so daily rows are upserted into D1 to preserve 30/90-day and long-term history.

The internal Attention index is:

`unique visitors + (stars × 10) + (watchers × 20) + (forks × 15) + (unique cloners × 3)`

It is a prioritization signal, not a project-quality score.

## One-time setup

1. Create a Cloudflare D1 database named `portfolio-github-analytics`.
2. Put its database ID in `wrangler.toml`.
3. Apply `schema.sql` with `npx wrangler d1 execute portfolio-github-analytics --file=./schema.sql --remote`.
4. Create a fine-grained GitHub token covering the repositories with **Administration: read** and save it as Worker secret `GITHUB_ANALYTICS_TOKEN`.
5. Create a strong independent dashboard access key and save it as Worker secret `DASHBOARD_ACCESS_KEY`. This is not the GitHub token.
6. Deploy with `npx wrangler deploy`.
7. Set the portfolio repository Actions variable `ANALYTICS_API_BASE` to the Worker origin, e.g. `https://portfolio-github-analytics.<account>.workers.dev`.
8. Redeploy Pages. `/admin/github/` will then prompt for the access key and load private data from the Worker.

## Required Worker secrets

- `GITHUB_ANALYTICS_TOKEN`
- `DASHBOARD_ACCESS_KEY`

The dashboard access key lives only in browser `sessionStorage` for the current tab/session. The Pages source contains neither secret.
