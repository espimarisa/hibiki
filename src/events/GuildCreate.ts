import { Guild } from "eris";
import { HibikiClient } from "classes/Client";
import { Event } from "../classes/Event";
import axios from "axios";

class GuildCreateEvent extends Event {
  events = ["guildCreate"];

  async run(guild: Guild, bot: HibikiClient) {
    // Checks to see if the bot was added to a blacklisted guild
    const blacklist = await bot.db.getBlacklistedGuild(guild.id);
    if (blacklist) {
      bot.log.warn(`Added to blacklisted guild, leaving: ${guild.name} (${guild.id})`);
      return guild.leave();
    }

    bot.log.info(`Added to guild: ${guild.name} (${guild.id})`);

    // DMs the owner the welcome message
    const owner = bot.users.get(guild.ownerID);
    if (owner && owner.id) {
      const ownerDM = await owner.getDMChannel();
      ownerDM.createMessage({
        embed: {
          title: "hello",
        },
      });
    }

    // Updates stats on bot listing websites if applicable
  }
}

export default new GuildCreateEvent();
