/**
 * @file Status switcher
 * @description Cycles between configured bot statuses
 * @module utils/statuses
 */

import type { HibikiClient } from "../classes/Client";

// Rotates bot statuses
export function rotateStatuses(bot: HibikiClient) {
  const string = bot.localeSystem.getLocaleFunction(bot.config.defaultLocale);

  function getStatus(number: number) {
    let status = bot.config.statuses[number];
    switch (status) {
      case "help":
        status = string("global.BOTSTATUS_HELP", { prefix: bot.config.prefixes[0] });
        break;
      case "guilds":
        status = string("global.BOTSTATUS_GUILDS", { guilds: bot.guilds.size });
        break;
      case "users":
        status = string("global.BOTSTATUS_USERS", { users: bot.users.size });
        break;
      case "version":
        status = string("global.BOTSTATUS_VERSION", { version: process.env.npm_package_version });
        break;
    }

    return status;
  }

  // Sets the initial status
  bot.editStatus("online", {
    name: getStatus(Math.floor(rotateStatuses.length * Math.random())),
    type: 3,
    url: "https://twitch.tv/",
  });

  // Timeout for switching
  setInterval(() => {
    bot.editStatus("online", {
      name: getStatus(Math.floor(rotateStatuses.length * Math.random())),
      type: 3,
      url: "https://twitch.tv/ifyouarereadingthisyoushouldgetalife",
    });
  }, 60000);
}
