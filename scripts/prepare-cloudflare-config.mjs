import { writeFile } from "node:fs/promises";

const databaseId = process.env.CLOUDFLARE_D1_DATABASE_ID;
if (!databaseId) {
  throw new Error(
    "CLOUDFLARE_D1_DATABASE_ID is missing. Add it as a Cloudflare Workers Build variable before deploying.",
  );
}

await writeFile(
  "wrangler.generated.jsonc",
  `${JSON.stringify({
    $schema: "./node_modules/wrangler/config-schema.json",
    name: "distincthardwoodflooring",
    main: "dist/server/index.js",
    compatibility_date: "2026-09-03",
    compatibility_flags: ["nodejs_compat"],
    assets: { directory: "dist/client", binding: "ASSETS" },
    d1_databases: [
      {
        binding: "DB",
        database_name: "distincthardwoodflooring-leads",
        database_id: databaseId,
        migrations_dir: "drizzle",
      },
    ],
    observability: { enabled: true },
  }, null, 2)}\n`,
);
