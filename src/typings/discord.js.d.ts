import type { getString } from "./locales.js";

declare module "discord.js" {
  declare interface CommandInteraction {
    getString: getString;
  }
}
