import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class steammonitorCommand extends Command {
  description = "Monitors a Steam account for future bans.";
  args = "[account:string] | [remove:string]";
  aliases = ["monitor", "monitorsteam"];
  cooldown = 3000;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    // List of users monitored
    const monitors = await this.bot.db.getAllUserMonitors(msg.author.id);
    if (!args.length) {
      return msg.createEmbed(
        `🎮 ${msg.string("utility.STEAMMONITOR")}`,
        msg.string("utility.STEAMMONITOR_CURRENTMONITORING", {
          monitors: monitors.length > 0 ? monitors.map((m) => `\`${m.username}\``).join(", ") : `${msg.string("global.NOBODY")}`,
        }),
      );
    }

    // Removal functionality
    if (args?.[0]?.toLowerCase() === "remove" || args?.[0]?.toLowerCase() === "delete") {
      if (!args?.[1]?.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.ERROR_INVALIDID"), "error");

      // Finds the monitor
      const validMonitor = monitors.find((monitor) => monitor.id === args[1] || monitor.username.toLowerCase() === args[1].toLowerCase());
      if (!validMonitor?.id) return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.ERROR_INVALIDID"), "error");

      // Deletes the monitor from the DB
      const monitor = await this.bot.db.deleteUserMonitor(msg.author.id, validMonitor.id);
      if (!monitor.deleted) return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");

      // Finds the monitor in the handler
      const foundMonitor = this.bot.monitorHandler.monitors.find(
        (monitor) => monitor.id === args[1] || monitor.username.toLowerCase() === args[1].toLowerCase(),
      );

      // Updates the handler and sends confirmation
      this.bot.reminderHandler.reminders.splice(this.bot.reminderHandler.reminders.indexOf(foundMonitor), 1);
      return msg.createEmbed(`🎮 ${msg.string("utility.STEAMMONITOR")}`, msg.string("utility.STEAMMONITOR_REMOVED"));
    }

    const key = this.bot.config.keys.steam;
    let query = args.join(" ");
    let steamid: string;
    let id;
    let profile: any;
    let bans;

    // Vanity URL checker
    if (/^\d+$/.test(args[0])) steamid = query;
    if (query.startsWith("https://steamcommunity.com/id/")) {
      query = args.join(" ").substring("https://steamcommunity.com/id/".length, args.join(" ").length);
    }

    query = encodeURIComponent(query.toLowerCase());

    // If no ID, look at a vanity URL
    if (!steamid) {
      id = await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${query}`).catch(() => {});

      if (!id || !id.data || id.data?.response.success !== 1) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");
      }

      steamid = id.data.response.steamid;
    }

    // Gets profile info
    profile = await axios
      .get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamid}`)
      .catch(() => {});

    profile = profile && profile.data?.response?.players?.[0] ? profile.data.response.players[0] : null;

    if (!profile || !profile.personaname) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");
    }

    // Embed construct
    const construct = {
      id: steamid,
      user: msg.author.id,
      username: profile.personaname,
      date: new Date().getTime(),
    };

    // Only 10 accounts can be monitored at a time
    if (monitors.length >= 10) return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.STEAMMONITOR_TOOMANY"), "error");

    if (!monitors.find((d: SteamMonitor) => d.id === steamid)) {
      bans = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${key}&steamids=${steamid}`).catch(() => {});
      bans = bans && bans.data.players?.[0] ? bans.data.players[0] : null;

      // If already banned
      if (bans.VACBanned || bans.NumberOfGameBans > 0) {
        return msg.createEmbed(
          msg.string("global.ERROR"),
          msg.string("utility.STEAMMONITOR_ALREADYBANNED", {
            profile: profile.personaname,
            type: bans.VACBanned ? 0 : 1,
          }),
          "error",
        );
      }

      // Updates db
      await this.bot.db.insertUserMonitor(construct);
      msg.createEmbed(
        `🎮 ${msg.string("utility.STEAMMONITOR")}`,
        msg.string("utility.STEAMMONITOR_MONITORING", { profile: profile.personaname }),
      );
    } else {
      msg.createEmbed(
        msg.string("global.ERROR"),
        msg.string("utility.STEAMMONITOR_ALREADYMONITORING", { profile: profile.personaname }),
        "error",
      );
    }
  }
}
