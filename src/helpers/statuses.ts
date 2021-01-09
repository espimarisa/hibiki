/**
 * @file Status switcher
 * @description Cycles between configured bot statuses
 */

import type { HibikiClient } from "../classes/Client";
import config from "../../config.json";

// Rotates bot statuses
export function statuses(bot: HibikiClient) {
  const statuses = config.statuses.map((status) => {
    if (status === "help") status = `${config.prefixes[0]}help | hibiki.app`;
    else if (status === "guilds") status = `${bot.guilds.size} guilds`;
    else if (status === "users") status = `${bot.users.size} users`;
    else if (status === "version") status = `v${process.env.npm_package_version} | hibiki.app`;
    return status;
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
  }, 60000);
}
