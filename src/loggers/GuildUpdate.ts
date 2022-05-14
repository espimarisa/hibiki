/**
 * @file GuildUpdateLogger
 * @description Logs when
 * @module HibikiMessageUpdateLogger
 */

import type { Guild } from "discord.js";
import { HibikiEvent } from "../classes/Event.js";

export class HibikiGuildUpdateLogger extends HibikiEvent {
  events: HibikiEventEmitter[] = ["guildUpdate"];

  public async run(_event: HibikiEventEmitter, oldGuild: Guild, newGuild: Guild) {
    if (!oldGuild || !newGuild) return;
  }
}
