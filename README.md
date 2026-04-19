# AI Signal Archive

Static-first AI changes tracker built with Astro 5, TypeScript, Pagefind, and Cloudflare Workers Static Assets, with GitHub Pages as a zero-cost public fallback.

## What is included

- Premium editorial homepage, archive, entity hubs, change hubs, update detail pages, and comparison pages
- Git-backed JSON data store for entities, sources, snapshots, updates, and comparisons
- Ingestion pipeline for official pricing pages, RSS feeds, and GitHub release feeds
- Quarantine rules for lower-confidence detections
- RSS, sitemap, robots, Pagefind search, and SVG Open Graph images
- GitHub Actions workflow for scheduled ingestion, verification, and deploy

## Local development

```bash
npm install
npm run dev
```

## Key scripts

```bash
npm run ingest
npm run ingest:full
npm run check
npm run test
npm run build
npm run deploy
```

## Deploy configuration

### GitHub Pages

Push to `main` and the `Deploy GitHub Pages` workflow will publish the static build automatically.

### Cloudflare Workers Static Assets

Set these GitHub repository secrets before enabling the Cloudflare deploy step:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `PUBLIC_SITE_URL`

The project is configured for `workers.dev` first. Static output is deployed from `dist` via `wrangler deploy`.

## Notes

- The repository ships with a seeded archive so the UI is populated on first build.
- Live ingestion is intentionally conservative and only auto-publishes high-trust or corroborated signals.
- `data/generated/quarantine.json` stores lower-confidence detections that should not be shown publicly.
