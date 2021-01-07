/**
 * @file API routes
 * @description Routings for the dashboard API
 * @module dashboard/routes/api
 */

import type { Profile } from "passport-discord";
import type { HibikiClient } from "../../classes/Client";
import type { Command } from "../../classes/Command";
import { validItems } from "../../utils/validItems";
import dayjs from "dayjs";
import express from "express";

// DayJS plugins
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import type { Channel, Role } from "eris";

dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

export = (bot: HibikiClient) => {
  router.get("/getItems/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });

    // Sends loaded cmds
    if (req.query.commands) {
      const cmds: any[] = [];
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
      const profileItems: any[] = [];
      validItems.forEach((i) => {
        if (i.category !== "Profile") return;
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

      // Finds the validItems
      const item = validItems.find((i) => i.id === c);
      if (!item) return delete guildConfig[c];

      // TODO: Refactor
      // Number type; has no maximum or minimum
      if (item.type === "number" && typeof opt !== "number") delete guildConfig[c];
      // Number type; has maximum
      else if (item.type === "number" && item.maximum && opt > item.maximum) guildConfig[c] = item.maximum;
      // Number type; has minimum
      else if (item.type === "number" && item.minimum && opt < item.minimum) guildConfig[c] = item.minimum;
      else if (item.type === "punishment") guildConfig[c] = opt.filter((p: string) => ["Purge", "Warn", "Mute"].includes(p));
      else if (item.type === "channelID" && !bot.guilds.get(guild.id).channels.find((channel) => channel.id === opt)) guildConfig[c] = null;
      // Channelarray
      // TODO: Test array stuff; add the rest of types
      else if (item.type === "channelArray")
        guildConfig[c] = opt.filter((c: Channel) => bot.guilds.get(guild.id).channels.find((channel) => channel.id === c.id));
      // Rolearrays
      else if (item.type === "roleArray") {
        guildConfig[c] = opt.filter((r: Role) => bot.guilds.get(guild.id).roles.find((rol) => rol.id === r.id));
        if (item.maximum && guildConfig[c].length > item.maximum) guildConfig[c].length = item.maximum;
      } else if (item.type === "roleID" && !bot.guilds.get(guild.id).roles.find((r) => r.id === opt)) guildConfig[c] = null;
      else if (item.type === "bool" && typeof opt !== "boolean") guildConfig[c] = null;
      // String; has maximum
      else if (item.type === "string" && item.maximum) guildConfig[c] = opt.substring(0, item.maximum);
      // String; has minimum
      else if (item.type === "string" && item.minimum && opt.length < item.minimum) guildConfig[c] = null;
      else if (item.type === "array" && !Array.isArray(guildConfig[c])) return (guildConfig[c] = null);
      // Valid emoji regex
      else if (
        item.type === "emoji" &&
        !/\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/.test(guildConfig[c])
      )
        delete guildConfig[c];

      // Disabled categories
      if (c === "disabledCategories") {
        const categories: string[] = [];

        // Ignores owner; pushes cmds
        bot.commands.forEach((c: Command) => {
          if (!categories.includes(c.category) && c.category !== "owner") categories.push(c.category);
        });

        // Filters guildConfig
        guildConfig[c] = guildConfig[c].filter((cat) => categories.includes(cat));
      }

      // Disabled commands
      if (c === "disabledCmds")
        guildConfig[c] = guildConfig[c].filter((cmd) => {
          const command = bot.commands.map((c) => c.name === cmd);
          // @ts-expect-error
          if (command?.allowDisable) return true;
          return false;
        });
    });

    // Updates the config
    await bot.db.updateGuildConfig(guildConfig);
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
    let guildConfig = await bot.db.getGuildConfig(guild.id);

    // Inserts guildConfig
    if (!guildConfig) {
      guildConfig = { id: guild.id };
      await bot.db.updateGuildConfig(guildConfig);
    }

    guildConfig = { id: guild.id };

    // Deletes the config
    await bot.db.deleteGuildConfig(guild.id);
    await bot.db.insertBlankGuildConfig(guild.id);
    res.sendStatus(200);
  });

  // Gets a profileConfig
  router.get("/getProfileConfig/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const user = req.user as Profile;

    // Gets the config
    const profileConfig = await bot.db.getUserConfig(user.id);
    if (!profileConfig) return res.status(204).end();
    res.send(profileConfig);
  });

  let invalidTimezone = false;
  // Updates a profileConfig
  router.post("/updateProfileConfig/:id", async (req, res) => {
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

    // Each profileConfig type/option
    Object.keys(profileConfig).forEach((c) => {
      if (c === "id") return;
      const opt = profileConfig[c];
      if (!opt) return;

      // Finds the validItems
      const item = validItems.find((i) => i.id === c);
      if (!item) return delete profileConfig[c];

      // Number type; has no maximum or minimum
      if (item.type === "number" && typeof opt !== "number") delete profileConfig[c];
      // Number type; has maximum
      else if (item.type === "number" && item.maximum && opt > item.maximum) profileConfig[c] = item.maximum;
      // Number type; has minimum
      else if (item.type === "number" && item.minimum && opt < item.minimum) profileConfig[c] = item.minimum;
      else if (item.type === "bool" && typeof opt !== "boolean") profileConfig[c] = null;
      // String; has maximum
      else if (item.type === "string" && item.maximum) profileConfig[c] = opt.substring(0, item.maximum);
      // String; has minimum
      else if (item.type === "string" && item.minimum && opt.length < item.minimum) profileConfig[c] = null;
      else if (item.type === "array" && !Array.isArray(profileConfig[c])) return (profileConfig[c] = null);
      // Timezone checking
      else if (item.id === "timezone") {
        try {
          dayjs(new Date()).tz(profileConfig[c]);
        } catch (_) {
          invalidTimezone = true;
        }

        if (invalidTimezone) return (profileConfig[c] = null);
      }
    });

    // Updates the config
    await bot.db.updateUserConfig(profileConfig);
    res.sendStatus(200);
  });

  // Resets a user's config
  router.post("/resetUserConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const user = req.user as Profile;
    let userConfig = await bot.db.getUserConfig(user.id);

    // Inserts guildConfig
    if (!userConfig) {
      await bot.db.insertBlankUserConfig(user.id);
      userConfig = { id: user.id };
    }

    userConfig = { id: user.id };

    // Deletes the config
    await bot.db.deleteUserConfig(user.id);

    // todo: stop doing this.
    await bot.db.updateUserConfig({ id: user.id });
    res.sendStatus(200);
  });

  return router;
};
