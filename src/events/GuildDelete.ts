import { Guild } from "eris";
import { HibikiClient } from "classes/Client";
import { Event } from "../classes/Event";

class GuildDeleteEvent extends Event {
  events = ["guildDelete"];

  run(guild: Guild, bot: HibikiClient) {
    bot.log.info(`Removed from guild: ${guild.name} (${guild.id})`);
  }
}

export default new GuildDeleteEvent();
