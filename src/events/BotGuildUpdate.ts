/**
 * @file BotGuildUpdate
 * @description Logs when added or removed from a guild
 * @module BotGuildUpdateEvent
 */

import type { Guild } from "discord.js";
import { HibikiEvent } from "../classes/Event";

export class HibikiBotGuildUpdateEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["guildCreate", "guildDelete"];

  public async run(event: HibikiEventEmitter, guild: Guild) {
    if (!guild) return;

    /**
     * Handles guildCreate specific functions
     */

    if (event === "guildCreate") {
      // Check if the guild is blacklisted
      const blacklisted = await this.bot.db.getBlacklistItem(guild.id, "GUILD");
      if (blacklisted) {
        guild.leave();
        return;
      }
      console.log(guild.id);
    }
  }
}
