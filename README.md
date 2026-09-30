# Distinct Hardwood Flooring

Independent GitHub and Cloudflare migration of the live Sites production version 113,
source commit `fe715eb790d0d528efefada84c1cc8460594f53f` (September 24, 2026).
The current Sites publication and its domain remain unchanged.

The public pages, images, estimate form, individual dashboard accounts, role checks,
2-hour sessions, account-specific new-lead notices, consent history, opt-out
suppression, archive/export tools and retention rules are carried over from production.

## Architecture

- GitHub: source history and automated checks.
- Cloudflare Workers: pages, APIs, HTTPS and daily scheduled retention cleanup.
- Cloudflare D1: separate database for the migration.
- No Firebase or ChatGPT sign-in dependency. Existing dashboard authentication remains.
- All images and font assets are in this repository.
- Migration `workers.dev` pages send `noindex`; analytics runs only on the production hostnames.

Cloudflare is the smallest migration because the existing application already runs on
Workers/D1. A GitHub Pages-only deployment cannot run the database-backed lead dashboard.

## Local verification

Use Node 24:

```sh
npm ci
npm run typecheck
npm test
npm run deploy:check
```

`npm test` covers public rendering and synthetic database-backed form, authentication,
permissions, retention, suppression and analytics cases. It does not contact the live
Sites database. `npm run deploy:check` packages the worker without publishing.

For development: `npm run db:migrate:local`, then `npm run dev`.
For a built preview: `npm run build`, then `npm run preview`.

## Deployment status

Prepared in a separate migration branch. A successful local build is not a live deployment.
See [MIGRATION.md](MIGRATION.md) for access requirements, database transfer, acceptance
checks and domain cutover. Do not change DNS until those checks pass.
