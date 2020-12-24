import type { Guild } from "eris";
import { Event } from "../classes/Event";

export class GuildDeleteEvent extends Event {
  events = ["guildDelete"];

  run(guild: Guild) {
    this.bot.log.info(`Removed from guild: ${guild.name} (${guild.id})`);
  }
}
