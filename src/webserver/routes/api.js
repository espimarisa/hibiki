/**
 * @fileoverview Dashboard API
 * @description Handles any API routes and requests
 * @param {Object} bot Main bot object
 */

const express = require("express");
const dayjs = require("dayjs");
const items = require("../../utils/items");

// Dayjs plugins
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

const router = express.Router();

module.exports = bot => {
  // Gets setup items, commands, and profile items
  router.get("/getItems/", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });

    // Sends loaded cmds
    if (req.query.commands) {
      const cmds = [];
      bot.commands.forEach(cmd => {
        if (!cmds.find(c => c.label === cmd.category) && cmd.category !== "Owner") cmds.push({ label: cmd.category, type: "group", children: [] });
      });

      // Ignores owner cmds
      bot.commands.forEach(cmd => {
        if (cmd.category === "Owner") return;
        if (cmd.allowdisable === false) return;
        cmds.find(c => c.label === cmd.category).children.push({ label: cmd.id });
      });

      // Sends cmds
      return res.status(200).send(cmds);
    }

    // Sends profile items
    if (req.query.profile) {
      const profileItems = [];
      items.forEach(i => {
        if (i.category !== "Profile") return;
        profileItems.push(i);
      });

      return res.status(200).send(profileItems);
    }

    // Sends configurable items
    res.status(200).send(items);
  });

  // Gets a guildconfig
  router.get("/getGuildConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const managableGuilds = req.user.guilds.filter(g => (g.permissions & 32) === 32 || (g.permissions & 8) === 8 && bot.guilds.get(g.id));
    const guild = managableGuilds.find(g => g.id === req.params.id);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage guild" });

    // Gets the config
    const guildConfig = await bot.db.table("guildconfig").get(guild.id).run();
    if (!guildConfig) return res.status(204).end();
    res.send(guildConfig);
  });

  // Updates a guildConfig
  router.post("/updateGuildConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const managableGuilds = req.user.guilds.filter(g => (g.permissions & 32) === 32 || (g.permissions & 8) === 8 && bot.guilds.get(g.id));
    const guild = managableGuilds.find(g => g.id === req.params.id);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage guild" });

    // Gets config
    let guildConfig = await bot.db.table("guildconfig").get(guild.id).run();

    // Inserts guildConfig
    if (!guildConfig) {
      guildConfig = { id: guild.id };
      await bot.db.table("guildconfig").insert(guildConfig).run();
    }

    // If no guildConfig
    if (!req.body) return res.status(204).end();
    guildConfig = req.body;

    // Each guildConfig type/option
    Object.keys(guildConfig).forEach(c => {
      if (c === "id") return;
      const opt = guildConfig[c];
      if (!opt) return;

      // Finds the items
      const item = items.find(i => i.id === c);
      if (!item) return delete guildConfig[c];

      // Number type; has no maximum or minimum
      if (item.type === "number" && typeof opt !== "number") delete guildConfig[c];
      // Number type; has maximum
      else if (item.type === "number" && item.maximum && opt > item.maximum) guildConfig[c] = item.maximum;
      // Number type; has minimum
      else if (item.type === "number" && item.minimum && opt < item.minimum) guildConfig[c] = item.minimum;
      else if (item.type === "punishment") guildConfig[c] = opt.filter(p => ["Purge", "Warn", "Mute"].includes(p));
      else if (item.type === "channelID" && !bot.guilds.get(guild.id).channels.find(channel => channel.id === opt)) guildConfig[c] = null;
      // Channelarray
      else if (item.type === "channelArray") guildConfig[c] = opt.filter(c => bot.guilds.get(guild.id).channels.find(channel => channel.id === c));
      // Rolearrays
      else if (item.type === "roleArray") {
        guildConfig[c] = opt.filter(r => bot.guilds.get(guild.id).roles.find(rol => rol.id === r));
        if (item.maximum && guildConfig[c].length > item.maximum) guildConfig[c].length = item.maximum;
      } else if (item.type === "roleID" && !bot.guilds.get(guild.id).roles.find(r => r.id === opt)) guildConfig[c] = null;
      else if (item.type === "bool" && typeof opt !== "boolean") guildConfig[c] = null;

      // String; has maximum
      else if (item.type === "string" && item.maximum) guildConfig[c] = opt.substring(0, item.maximum);
      // String; has minimum
      else if (item.type === "string" && item.minimum && opt.length < item.minimum) guildConfig[c] = null;
      else if (item.type === "array" && !Array.isArray(guildConfig[c])) return guildConfig[c] = null;
      // Valid emoji regex
      else if (item.type === "emoji" && !/\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/.test(guildConfig[c]))
        delete guildConfig[c];

      // Disabled categories
      if (c === "disabledCategories") {
        const categories = [];

        // Ignores owner; pushes cmds
        bot.commands.forEach(c => {
          if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category);
        });

        // Filters guildConfig
        guildConfig[c] = guildConfig[c].filter(cat => categories.includes(cat));
      }

      // Disabled commands
      if (c === "disabledCmds") guildConfig[c] = guildConfig[c].filter(cmd => {
        const command = bot.commands.map(c => c.id === cmd);
        if (command && command.allowdisable === true) return true;
        return false;
      });
    });

    // Updates the config
    await bot.db.table("guildconfig").get(guild.id).update(guildConfig).run();
    res.sendStatus(200);
  });

  // Resets a guild config
  router.post("/resetGuildConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const managableGuilds = req.user.guilds.filter(g => (g.permissions & 32) === 32 || (g.permissions & 8) === 8 && bot.guilds.get(g.id));
    const guild = managableGuilds.find(g => g.id === req.params.id);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage guild" });

    // Gets config
    let guildConfig = await bot.db.table("guildconfig").get(guild.id).run();

    // Inserts guildConfig
    if (!guildConfig) {
      guildConfig = { id: guild.id };
      await bot.db.table("guildconfig").insert(guildConfig).run();
    }

    guildConfig = { id: guild.id };

    // Deletes the config
    await bot.db.table("guildconfig").get(guild.id).delete().run();
    await bot.db.table("guildconfig").insert({ id: guild.id }).run();
    res.sendStatus(200);
  });

  // Gets a profileConfig
  router.get("/getProfileConfig/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });

    // Gets the config
    const profileConfig = await bot.db.table("userconfig").get(req.user.id).run();
    if (!profileConfig) return res.status(204).end();
    res.send(profileConfig);
  });

  let invalidTimezone = false;
  // Updates a profileConfig
  router.post("/updateProfileConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });

    // Gets configs
    let profileConfig = await bot.db.table("userconfig").get(req.user.id).run();

    // Inserts profileConfig
    if (!profileConfig) {
      profileConfig = { id: req.user.id };
      await bot.db.table("userconfig").insert(profileConfig).run();
    }

    // If no profileConfig
    if (!req.body) return res.status(204).end();
    profileConfig = req.body;

    // Each profileConfig type/option
    Object.keys(profileConfig).forEach(c => {
      if (c === "id") return;
      const opt = profileConfig[c];
      if (!opt) return;

      // Finds the items
      const item = items.find(i => i.id === c);
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
      else if (item.type === "array" && !Array.isArray(profileConfig[c])) return profileConfig[c] = null;

      // Timezone checking
      else if (item.id === "timezone") {
        try { dayjs(new Date()).tz(profileConfig[c]); } catch (_) {
          invalidTimezone = true;
        }

        if (invalidTimezone) return profileConfig[c] = null;
      }
    });

    // Updates the config
    await bot.db.table("userconfig").get(req.user.id).update(profileConfig).run();
    res.sendStatus(200);
  });

  // Resets a profile config
  router.post("/resetProfileConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });

    // Gets configs
    let profileConfig = await bot.db.table("userconfig").get(req.user.id).run();

    // Inserts guildConfig
    if (!profileConfig) {
      profileConfig = { id: req.user.id };
      await bot.db.table("userconfig").insert(profileConfig).run();
    }

    profileConfig = { id: req.user.id };

    // Deletes the config
    await bot.db.table("userconfig").get(req.user.id).delete().run();
    await bot.db.table("userconfig").insert({ id: req.user.id }).run();
    res.sendStatus(200);
  });

  return router;
};
