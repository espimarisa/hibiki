import { Guild } from "eris";
import { HibikiClient } from "classes/Client";
import { Event } from "../classes/Event";

class GuildCreateEvent extends Event {
  events = ["guildCreate"];

  async run(guild: Guild, bot: HibikiClient): Promise<void> {
    bot.log.info(`Added to guild: ${guild.name} (${guild.id})`);
  }
}

export default new GuildCreateEvent();
