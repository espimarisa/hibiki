/**
 * @file This only exists because Drizzle is shit and has a fit with import.meta.url in other files. Really?
 * @license zlib
 */

import { sql } from "drizzle-orm";

// A regex in raw SQL form to validate Discord snowflakes.
export const DISCORD_SNOWFLAKE_REGEX_SQL = sql.raw("^(?<id>\\d{17,20})$");
