import { type Config, defineConfig } from "drizzle-kit";

import { env } from "$shared/env.ts";

// biome-ignore lint/style/noDefaultExport: Config file
export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/*",
  driver: "pg",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    port: Number.parseInt(env.POSTGRES_PORT),
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
