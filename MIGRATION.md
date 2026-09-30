# Migration and cutover

## Current state

- Source: Sites production version 113, commit `fe715eb790d0d528efefada84c1cc8460594f53f`.
- Target worker name: `distinct-hardwood-migration`.
- Target database name: `distinct-hardwood-migration-leads`.
- Runtime compatibility is pinned to 2026-05-22, the newest date supported by the
  lockfile-pinned Workers runtime. Update tooling and retest before advancing it.
- No production domain routes are declared. Deployment cannot change the Sites domain.
- No customer records, passwords, password hashes, session secrets or tokens are in Git.
- The production form currently accepts NY, NJ and CT. This migration preserves that
  current behavior and copy, regardless of older project notes mentioning NY only.

## Provision the independent deployment

1. Authenticate to the intended Cloudflare account with `npx wrangler login` and verify
   it with `npx wrangler whoami`. Do not start a paid subscription without owner agreement.
2. Create a separate database:
   `npx wrangler d1 create distinct-hardwood-migration-leads`.
3. Set `CLOUDFLARE_D1_DATABASE_ID` to the returned UUID and run
   `node scripts/configure-deployment.mjs`. Never substitute a guessed UUID or an existing
   production database. Commit the confirmed non-secret database UUID for local deploys,
   or use the GitHub environment variable described below.
4. Apply schema with `npm run db:migrate:remote`. Use the root `wrangler.jsonc` for D1
   commands, since build output uses a different working directory for migration paths.
5. Generate a fresh random signing secret, store it through `npx wrangler secret put
   LEADS_SESSION_SECRET`, and keep it out of shell history and source control. Existing
   password hashes can be imported unchanged; old sessions should not be carried over.
6. Run the checks in README, deploy with `npx wrangler deploy`, and record the returned
   workers.dev URL. The actual hostname depends on the authenticated account.

### GitHub deployments

The manual workflow `Deploy independent Cloudflare site` builds/tests before migrating
or deploying. Its `cloudflare-migration` environment needs:

| Setting | Kind |
| --- | --- |
| CLOUDFLARE_API_TOKEN | Secret, scoped to the intended account with Workers Scripts edit and D1 edit |
| CLOUDFLARE_ACCOUNT_ID | Secret |
| LEADS_SESSION_SECRET | Secret, independent random value |
| CLOUDFLARE_D1_DATABASE_ID | Environment variable, actual new database UUID |

Merge the migration branch after validation so the manual workflow appears on the
repository's Actions page. Select the desired ref when running it. No automatic
production-domain deployment is enabled by this migration.

## Data transfer

The production database contains these application tables:
`estimates`, `dashboard_users`, `marketing_suppressions`, `audit_events`,
`anonymous_outcomes`, `maintenance_runs`, `dashboard_login_throttles`.

A code deployment does not copy them. Before cutover, securely export complete rows
from the source and import them into the new, initialized D1 database. Preserve IDs,
all lead fields, consent evidence, suppression records, audit history, user roles,
password salts/hashes, session versions and per-user notification timestamps. Transfer
exports through private storage only, never a public repository or Actions artifact.
Do not accept a truncated or partial Sites table response as an export.

The script `scripts/prepare-data-import.mjs` converts a complete JSON snapshot of table
pages into validated data-only SQL. It rejects truncated pages, incomplete pagination,
missing tables, unknown columns and duplicate primary keys; it performs a local SQLite
import first to check schema constraints. It does not read from production or upload data.

```sh
node scripts/prepare-data-import.mjs migration-private/source-pages.json migration-private/import.sql
npx wrangler d1 execute DB --remote --config wrangler.jsonc --file migration-private/import.sql
```

Import only into an empty migration database after clearing synthetic preview records.
Check source/target row counts and log in as both real dashboard users. Setup is closed
by design; a fresh empty database will not create dashboard accounts automatically.

The two copies do not share data. Just before DNS cutover, coordinate a brief intake
pause or a consistent final snapshot, and reconcile submissions while DNS propagates.
If rollback is necessary, preserve leads received by the new site before sending traffic
back to Sites. Keep Sites accessible for reconciliation; do not delete it.

## Acceptance checks before DNS

- Live HTTPS loads at the independent URL; desktop/mobile match production.
- Submit a clearly labeled synthetic estimate, including the Other customer type.
- Confirm the new lead is in the new dashboard, not the Sites database.
- Both real user accounts work, notifications remain account-specific, sessions expire,
  logout invalidates sessions and anonymous visitors cannot access lead data.
- Status updates, contact export, archive and retention permissions work.
- Scheduled cleanup exists and preserves held, active and review-required records.
- Public preview pages are noindex and do not send production analytics.
- Verify imported counts, latest lead, suppression records and role assignments.
- Record the deployment URL, database UUID, verified commit and rollback instructions.

## GoDaddy cutover, only after acceptance

For the standard Cloudflare Workers Custom Domain route, Cloudflare requires an active
DNS zone. GoDaddy can remain the domain registrar. The final GoDaddy action may be a
nameserver change, not just an A-record edit.

Prepare the zone first: copy every current DNS record, especially MX/TXT mail records,
SPF/DKIM/DMARC, verification records and other subdomains. Confirm DNSSEC handling with
the current DNS provider. Use only the two nameservers actually assigned to this zone
by Cloudflare; none have been obtained or guessed here.

Once the zone is active, attach the apex and www hostnames to the tested Worker and
verify certificates and both URLs. This domain attachment is an additional Cloudflare
step and cannot be honestly marked complete while the zone is inactive. Maintain the
existing Sites routing until ready to cut over. Record the prior GoDaddy DNS/nameserver
values so they can be restored, and account for DNS caching when rolling back.

Cloudflare guidance:
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/wrangler/commands/
- https://developers.cloudflare.com/workers/platform/pricing/

Pricing must be confirmed in the account. A free tier exists, but its CPU limits may
be unsuitable for server rendering and password verification; budget for the published
$5/month Workers paid base plus any usage overages if the free tier fails live checks.
No paid service has been enabled by this preparation.
