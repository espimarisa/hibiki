import env from "$shared/env.ts";
import { defineConfig, type Config } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema/*",
  driver: "pg",
  dbCredentials: {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
    database: env.POSTGRES_DB,
  },
  verbose: true,
  strict: true,
}) satisfies Config;
