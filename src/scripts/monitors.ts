/**
 * @file Steam monitor handler
 * @description Checks to see if monitored steam accounts have been banned
 * @module scripts/monitors
 */

import type { HibikiClient } from "../classes/Client";
import { convertHex } from "../utils/embed";
import axios from "axios";

export class MonitorHandler {
  bot: HibikiClient;
  monitors: SteamMonitor[] = [];

  constructor(bot: HibikiClient) {
    this.bot = bot;
    if (!this.bot.config.keys.steam) return;

    setTimeout(() => {
      setInterval(async () => {
        this.bot.db.getAllMonitors().then((monitors) => (this.monitors = monitors));
        this.monitors.forEach(async (monitor: SteamMonitor, i: number) => {
          if (Date.now() - monitor.date > 259200000) {
            this.bot.db.deleteUserMonitor(monitor.user, monitor.id);
            return;
          }

          // IDs to search
          let bans = [];
          const ids: string[] = [];
          this.monitors.forEach((monitor) => {
            ids.push(monitor.id);
          });

          if (this.monitors.length) {
            const body = await axios
              .get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.bot.config.keys.steam}&steamids=${ids}`)
              .catch(() => {});

            if (body && body.data?.players) bans = body.data.players;
            else return;
          }

          bans.forEach(async (ban: Record<string, unknown>) => {
            if (ban.VACBanned || ban.NumberOfGameBans > 0) {
              await this.bot.db.deleteUserMonitor(monitor.user, monitor.id);
              this.monitors.splice(i);

              const user = bot.users.get(monitor.user);
              if (!user) return;
              const dm = await user.getDMChannel().catch(() => {});
              if (!dm) return;

              // Gets the user's locale
              const userLocale = await bot.localeSystem.getUserLocale(`${user}`, bot);
              const string = bot.localeSystem.getLocaleFunction(userLocale);

              // Sends the user a message
              return dm
                .createMessage({
                  embed: {
                    title: `🎮 ${string("utility.STEAMMONITOR")}`,
                    description: string("utility.STEAMMONITOR_BANNED", { profile: monitor.username, type: ban.VACBanned ? 0 : 1 }),
                    color: convertHex("general"),
                  },
                })
                .catch(() => {});
            }
          });
        });
      }, 3600000);
    }, 10000);
  }
}
