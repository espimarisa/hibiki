/**
 * @file Item existence checker
 * @description Checks if a certain item exists or not
 * @module utils/itemExists
 */

import type { Guild } from "eris";
import type { RethinkProvider } from "../classes/RethinkDB";

// Checks if a role or channel exists and deletes it from the database if it doesn't exist
export async function itemExists(
  guild: Guild,
  type: "role" | "channel",
  item: string | string[],
  db: RethinkProvider,
  configItem: keyof GuildConfig,
) {
  // Type to check for
  let check = true;

  // Role arrays
  if (type === "role" && Array.isArray(item)) {
    const guildRoles = item.filter((i) => {
      const a = guild.roles.has(i);
      if (!a) check = false;
      return a;
    });

    if (!check) {
      const guildconfig = await db.getGuildConfig(guild.id);
      if (!guildconfig || !guildconfig[configItem]) return false;
      guildconfig[configItem as string] = guildRoles;
      await db.updateGuildConfig(guild.id, guildconfig);
    }

    return guildRoles;
  }

  // Channel arrays
  else if (type === "channel" && Array.isArray(item)) {
    const guildChannels = item.filter((i) => {
      const a = guild.channels.has(i);
      if (!a) check = false;
      return a;
    });

    if (!check) {
      const guildconfig = await db.getGuildConfig(guild.id);
      if (!guildconfig || !guildconfig[configItem]) return false;
      guildconfig[configItem as string] = guildChannels;
      await db.updateGuildConfig(guild.id, guildconfig);
    }

    return guildChannels;
  }

  // Single role or channel
  else if (typeof item === "string") {
    if (type === "role") check = guild.roles.has(item);
    else if (type === "channel") check = guild.channels.has(item);

    if (check) return true;
    // Deletes the item if the check failed
    else if (!check) {
      const guildconfig = await db.getGuildConfig(guild.id);
      if (!guildconfig || !guildconfig[configItem]) return false;
      if (guildconfig[item]) delete guildconfig[configItem];
      await db.replaceGuildConfig(guild.id, guildconfig);
    }

    return check;
  }
}
