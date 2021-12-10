/**
 * @file GuildUpdateLogger
 * @description Logs when
 * @module HibikiMessageUpdateLogger
 */

import type { Guild } from "discord.js";
import { HibikiEvent } from "../classes/Event";

export class HibikiGuildUpdateLogger extends HibikiEvent {
  events: HibikiEventEmitter[] = ["guildUpdate"];

  public async run(event: HibikiEventEmitter, oldGuild: Guild, newGuild: Guild) {
    if (!oldGuild || !newGuild) return;
    return;
  }
}
