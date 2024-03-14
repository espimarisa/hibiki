// Re-exports the client
export { default } from "$db/client.ts";

// Guild config functions
export { default as createBlankGuildConfig } from "$db/lib/guild_config/blank.ts";
export { default as deleteGuildConfig } from "$db/lib/guild_config/delete.ts";
export { default as getGuildConfig } from "$db/lib/guild_config/get.ts";
export { default as updateGuildConfig } from "$db/lib/guild_config/update.ts";

// User config functions
export { default as createBlankUserConfig } from "$db/lib/user_config/blank.ts";
export { default as deleteUserConfig } from "$db/lib/user_config/delete.ts";
export { default as getUserConfig } from "$db/lib/user_config/get.ts";
export { default as updateUserConfig } from "$db/lib/user_config/update.ts";
