import type { HibikiLocaleCode } from "./locales.js";

interface HibikiGuildConfig {
  // The guild's ID
  guild_id: DiscordSnowflake;

  // The default locale for new members in the guild
  locale?: HibikiLocaleCode;
}

interface HibikiUserConfig {
  // The user's ID
  user_id: DiscordSnowflake;

  // The custom locale set by the user
  locale?: HibikiLocaleCode;
}
