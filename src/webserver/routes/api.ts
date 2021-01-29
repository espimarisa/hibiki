/**
 * @file API routes
 * @description Routings for the dashboard API
 * @module dashboard/routes/api
 */

import type { Channel, Role } from "eris";
import type { Profile } from "passport-discord";
import type { HibikiClient } from "../../classes/Client";
import type { Command } from "../../classes/Command";
import { defaultEmojiRegex, fullInviteRegex } from "../../helpers/constants";
import { validItems } from "../../utils/validItems";
import dayjs from "dayjs";
import express from "express";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

export = (bot: HibikiClient) => {
  router.get("/getItems/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });

    // Sends loaded cmds
    if (req.query.commands) {
      const cmds: Bulmaselect[] = [];
      bot.commands.forEach((cmd) => {
        if (!cmds.find((c) => c.label === cmd.category) && cmd.category !== "owner")
          cmds.push({ label: cmd.category, type: "group", children: [] });
      });

      // Ignores owner cmds
      bot.commands.forEach((cmd) => {
        if (cmd.category === "owner") return;
        if (cmd.allowdisable === false) return;
        cmds.find((c) => c.label === cmd.category).children.push({ label: cmd.name });
      });

      // Sends cmds
      return res.status(200).send(cmds);
    }

    // Sends profile validItems
    if (req.query.profile) {
      const profileItems: UserConfig[] = [];
      validItems.forEach((i) => {
        if (i.category !== "profile") return;
        profileItems.push(i);
      });

      return res.status(200).send(profileItems);
    }

    // Sends configurable validItems
    res.status(200).send(validItems);
  });

  // Gets a guildconfig
  router.get("/getGuildConfig/:id", async (req, res) => {
    const user = req.user as Profile;

    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const managableGuilds = user.guilds.filter((g) => (g.permissions & 32) === 32 || ((g.permissions & 8) === 8 && bot.guilds.get(g.id)));
    const guild = managableGuilds.find((g) => g.id === req.params.id);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage this guild" });

    // Gets the config
    const guildConfig = await bot.db.getGuildConfig(guild.id);
    if (!guildConfig) return res.status(204).end();
    res.send(guildConfig);
  });

  // Updates a guildConfig
  router.post("/updateGuildConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    const user = req.user as Profile;

    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const managableGuilds = user.guilds.filter((g) => (g.permissions & 32) === 32 || ((g.permissions & 8) === 8 && bot.guilds.get(g.id)));
    const guild = managableGuilds.find((g) => g.id === req.params.id);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage guild" });

    // Gets config
    let guildConfig = await bot.db.getGuildConfig(guild.id);

    // Inserts guildConfig
    if (!guildConfig) {
      guildConfig = { id: guild.id };
      await bot.db.insertBlankGuildConfig(guild.id);
    }

    // If no guildConfig
    if (!req.body) return res.status(204).end();
    guildConfig = req.body;

    // Each guildConfig type/option
    Object.keys(guildConfig).forEach((c) => {
      if (c === "id") return;
      const opt = guildConfig[c];
      if (!opt) return;

      // Finds the item
      const item = validItems.find((i) => i.id === c);
      if (!item || item.category === "profile" || opt === null) delete guildConfig[c];

      // Numbers
      if (item.type === "number") {
        if (typeof opt !== "number") delete guildConfig[c];
        if (item.maximum && opt > item.maximum) guildConfig[c] = item.maximum;
        if (item.minimum && opt < item.minimum) guildConfig[c] = item.minimum;
      }
      // Punishments
      else if (item.type === "punishment" && Array.isArray(guildConfig[c]) && guildConfig[c].length) {
        guildConfig[c] = opt.filter((p: string) => ["Purge", "Warn", "Mute"].includes(p));
      }

      // Raid punishments
      else if (item.type === "raidPunishment" && Array.isArray(guildConfig[c]) && guildConfig[c].length) {
        guildConfig[c] = opt.filter((p: string) => ["Ban", "Kick", "Mute"].includes(p));
      }

      // Channel IDs
      else if (item.type === "channelID" && !bot.guilds.get(guild.id).channels.find((channel) => channel.id === opt)) {
        guildConfig[c] = null;
      }

      // ChannelArray
      else if (item.type === "channelArray" && Array.isArray(guildConfig[c]) && guildConfig[c].length) {
        guildConfig[c] = opt.filter((c: Channel) => bot.guilds.get(guild.id).channels.find((channel) => channel.id === c.id));
      }

      // RoleArray
      else if (item.type === "roleArray" && Array.isArray(guildConfig[c]) && guildConfig[c].length) {
        guildConfig[c] = opt.filter((r: Role) => bot.guilds.get(guild.id).roles.find((rol) => rol.id === r.id));
        if (item.maximum && guildConfig[c].length > item.maximum) guildConfig[c].length = item.maximum;
      }

      // Role IDs
      else if (item.type === "roleID" && !bot.guilds.get(guild.id).roles.find((r) => r.id === opt)) {
        delete guildConfig[c];
      }

      // Booleans
      else if (item.type === "bool" && typeof opt !== "boolean") {
        delete guildConfig[c];
      }

      // Strings
      else if (item.type === "string") {
        if (item.inviteFilter) guildConfig[c] = guildConfig[c].replace(fullInviteRegex, "");
        if (item.maximum) guildConfig[c] = guildConfig[c].substring(0, item.maximum);
        if (item.minimum && guildConfig[c].length < item.minimum) delete guildConfig[c];
      }

      // Emojis
      else if (item.type === "emoji" && defaultEmojiRegex.test(guildConfig[c])) {
        delete guildConfig[c];
      }

      // Locales
      else if (item.type === "locale") {
        delete guildConfig[c];
      }

      // Punishments
      else if (item.type === "punishment") {
        guildConfig[c] = guildConfig[c].filter((punishment: string) => ["Purge", "Mute", "Warn"].includes(punishment));
      }

      // Raid punishments
      else if (item.type === "raidPunishment") {
        guildConfig[c] = guildConfig[c].filter((punishment: string) => ["Ban", "Kick", "Mute"].includes(punishment));
      }

      // Disabled categories
      if (c === "disabledCategories" && guildConfig[c]) {
        const categories: string[] = [];

        // Ignores owner; pushes cmds
        bot.commands.forEach((c: Command) => {
          if (!categories.includes(c.category) && c.category !== "owner") categories.push(c.category);
        });

        // Filters guildConfig
        guildConfig[c] = guildConfig[c].filter((cat) => categories.includes(cat));
      }

      // Disabled commands
      if (c === "disabledCmds" && guildConfig[c])
        guildConfig[c] = guildConfig[c].filter((cmd) => {
          const command = bot.commands.map((c) => c.name === cmd);
          // @ts-ignore
          if (command?.allowDisable) return true;
          return false;
        });

      // Arrays
      if (
        (item.type === "channelArray" ||
          item.type === "roleArray" ||
          item.type === "punishment" ||
          item.type === "raidPunishment" ||
          item.type === "array") &&
        (!Array.isArray(guildConfig[c]) || !guildConfig[c].length)
      ) {
        delete guildConfig[c];
      }
    });

    // Updates the config
    await bot.db.updateGuildConfig(guild.id, guildConfig);
    res.sendStatus(200);
  });

  // Resets a guild config
  router.post("/resetGuildConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const user = req.user as Profile;

    const managableGuilds = user.guilds.filter((g) => (g.permissions & 32) === 32 || ((g.permissions & 8) === 8 && bot.guilds.get(g.id)));
    const guild = managableGuilds.find((g) => g.id === req.params.id);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage guild" });

    // Gets config
    const guildConfig = await bot.db.getGuildConfig(guild.id);

    // Inserts guildConfig
    if (!guildConfig) {
      await bot.db.insertBlankGuildConfig(guild.id);
    }

    // Deletes the config
    await bot.db.deleteGuildConfig(guild.id);
    await bot.db.insertBlankGuildConfig(guild.id);
    res.sendStatus(200);
  });

  // Gets a profileConfig
  router.get("/getUserConfig/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const user = req.user as Profile;

    // Gets the config
    const profileConfig = await bot.db.getUserConfig(user.id);
    if (!profileConfig) return res.status(204).end();
    res.send(profileConfig);
  });

  // Updates a profileConfig
  router.post("/updateUserConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const user = req.user as Profile;

    // Gets configs
    let profileConfig = await bot.db.getUserConfig(user.id);

    // Inserts profileConfig
    if (!profileConfig) {
      profileConfig = { id: user.id };
      await bot.db.insertBlankUserConfig(user.id);
    }

    // If no profileConfig
    if (!req.body) return res.status(204).end();
    profileConfig = req.body;

    if (profileConfig.id !== user.id) return res.status(403).end();

    // Each profileConfig type/option
    Object.keys(profileConfig).forEach((c) => {
      if (c === "id") return;
      const opt = profileConfig[c];
      if (!opt) return;

      // Finds the item
      const item = validItems.find((i) => i.id === c);
      if (!item || item.category !== "profile") delete profileConfig[c];
      // Numbers
      else if (item.type === "number") {
        if (typeof opt !== "number") return delete profileConfig[c];
        if (item.maximum && opt > item.maximum) profileConfig[c] = item.maximum;
        if (item.minimum && opt < item.minimum) profileConfig[c] = item.minimum;
      }
      // Booleans
      else if (item.type === "bool" && typeof opt !== "boolean") delete profileConfig[c];
      // Strings
      else if (item.type === "string") {
        if (item.inviteFilter) profileConfig[c] = profileConfig[c].replace(fullInviteRegex, "");
        if (item.maximum) profileConfig[c] = profileConfig[c].substring(0, item.maximum);
        if (item.minimum && profileConfig[c].length < item.minimum) delete profileConfig[c];
      }
      // Arrays
      else if (item.type === "array" && !Array.isArray(profileConfig[c])) delete profileConfig[c];
      // Timezone checking
      else if (item.id === "timezone") {
        let invalidTimezone = false;

        try {
          dayjs(new Date()).tz(profileConfig[c]);
        } catch (err) {
          invalidTimezone = true;
        }

        if (invalidTimezone) delete profileConfig[c];
      }
    });
    profileConfig.id = user.id;

    // Updates the config
    await bot.db.updateUserConfig(user.id, profileConfig);
    res.sendStatus(200);
  });

  // Resets a user's config
  router.post("/resetUserConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const user = req.user as Profile;
    const userConfig = await bot.db.getUserConfig(user.id);

    // Inserts guildConfig
    if (!userConfig) {
      await bot.db.insertBlankUserConfig(user.id);
    }

    // Deletes the config
    await bot.db.deleteUserConfig(user.id);
    res.sendStatus(200);
  });

  return router;
};
