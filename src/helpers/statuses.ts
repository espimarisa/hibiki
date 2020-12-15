/**
 * @file Status switcher
 * @description Cycles between configured bot statuses
 */

import { HibikiClient } from "../classes/Client";
import { version } from "../../package.json";
import config from "../../config.json";

// Rotates bot statuses
export function switchStatuses(bot: HibikiClient) {
  const statuses = config.statuses.map((s) => {
    if (s === "help") s = `${config.prefixes[0]}help | hibiki.app`;
    else if (s === "guilds") s = `${bot.guilds.size} guilds`;
    else if (s === "users") s = `${bot.users.size} users`;
    else if (s === "version") s = `v${version} | hibiki.app`;
    return s;
  });

  // Sets the initial status
  bot.editStatus("online", {
    name: statuses[Math.floor(statuses.length * Math.random())],
    type: 3,
    url: "https://twitch.tv/",
  });

  // Timeout for switching
  setInterval(() => {
    bot.editStatus("online", {
      name: statuses[Math.floor(statuses.length * Math.random())],
      type: 3,
      url: "https://twitch.tv/.",
    });
  }, 50000);
}
