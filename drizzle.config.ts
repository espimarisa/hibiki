import { env } from "$utils/env.ts";
import { type Config, defineConfig } from "drizzle-kit";

// biome-ignore lint/style/noDefaultExport: Config file
export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema/*",
  dialect: "postgresql",
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
