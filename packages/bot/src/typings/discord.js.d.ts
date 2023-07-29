import "discord.js";

declare module "discord.js" {
  interface CommandInteraction {
    lng?: string;
  }
}
