interface HibikiGuildConfig {
  // The guild's ID
  guild_id: DiscordSnowflake;
}

interface HibikiUserConfig {
  // The user's ID
  user_id: DiscordSnowflake;

  // A custom locale
  locale?: string | null;
}
