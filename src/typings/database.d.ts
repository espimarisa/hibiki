/**
 * @file database.d.ts
 * @description Typings for any database items
 * @typedef database.d.ts
 */

import type { HibikiLocaleCode } from "./locales.js";

interface HibikiGuildConfig {
  guild_id: DiscordSnowflake;
  locale?: HibikiLocaleCode;
}

interface HibikiUserConfig {
  user_id: DiscordSnowflake;
  locale?: HibikiLocaleCode;
}
