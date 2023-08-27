import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
export default prisma;

// Guild config functions
export { default as createBlankGuildConfig } from "./lib/guild_config/blank.js";
export { default as deleteGuildConfig } from "./lib/guild_config/delete.js";
export { default as getGuildConfig } from "./lib/guild_config/get.js";
export { default as updateGuildConfig } from "./lib/guild_config/update.js";

// User config functions
export { default as createBlankUserConfig } from "./lib/user_config/blank.js";
export { default as deleteUserConfig } from "./lib/user_config/delete.js";
export { default as getUserConfig } from "./lib/user_config/get.js";
export { default as updateUserConfig } from "./lib/user_config/update.js";
