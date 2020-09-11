/**
 * @fileoverview Dashboard API
 * @description Handles any API routes and requests
 * @param {Object} bot Main bot object
 */

const express = require("express");
const items = require("../../utils/items");

const router = express.Router();

module.exports = bot => {
  // Gets a user's bio
  router.get("/getBio", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "401" });
    const userConfig = await bot.db.table("usercfg").get(req.user.id).run();
    if (!userConfig || !userConfig.bio) return res.status(404).send({ error: "404" });
    res.send(userConfig.bio);
  });

  // Updates a user's bio
  router.get("/updateBio", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "401" });
    let userConfig = await bot.db.table("usercfg").get(req.user.id).run();
    if (!req.query || typeof req.query.bio === "undefined") return res.status(400).send({ error: "400" });
    let bio = req.query.bio;
    if (req.query.bio.length === 0 && typeof req.query.bio === "string") bio = null;
    else bio = bio.substring(0, 120);

    if (!userConfig) {
      userConfig = { id: req.user.id, bio: bio };
      await bot.db.table("usercfg").insert(userConfig).run();
      return res.sendStatus(200);
    }

    userConfig.bio = bio;
    await bot.db.table("usercfg").get(req.user.id).update(userConfig).run();
    res.sendStatus(200);
  });

  // Gets items
  router.get("/getItems", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "401" });

    // Sends loaded cmds
    if (req.query.commands) {
      const cmds = [];
      bot.commands.forEach(cmd => {
        if (!cmds.find(c => c.label === cmd.category) && cmd.category !== "Owner")
          cmds.push({ label: cmd.category, type: "optgroup", children: [] });
      });

      // Ignores owner cmds
      bot.commands.forEach(cmd => {
        if (cmd.category === "Owner") return;
        cmds.find(c => c.label === cmd.category).children.push({ text: cmd.id, value: cmd.id });
      });

      // Sends cmds
      return res.status(200).send(cmds);
    }

    // Sends configurable items
    res.status(200).send(items);
  });

  // Gets a guildConfig
  router.get("/getConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "401" });
    const managableGuilds = req.user.guilds.filter(g => (g.permissions & 32) === 32 || (g.permissions & 8) === 8 && bot.guilds.get(g.id));
    const guild = managableGuilds.find(g => g.id === req.params.id);
    if (!guild) return res.status(403);

    // Gets the config
    const guildConfig = await bot.db.table("guildcfg").get(guild.id).run();
    if (!guildConfig) return res.status(404).send({ error: "404" });
    res.send(guildConfig);
  });

  // Updates a guildConfig
  router.post("/updateConfig/:id", async (req, res) => {
    // Checks to see if the user has permission
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const managableGuilds = req.user.guilds.filter(g => (g.permissions & 32) === 32 || (g.permissions & 8) === 8 && bot.guilds.get(g.id));
    const guild = managableGuilds.find(g => g.id === req.params.id);
    if (!guild) return res.status(403);

    // Gets configs
    let guildConfig = await bot.db.table("guildcfg").get(guild.id).run();
    // let userConfig = await bot.db.table("usercfg").get(req.user.id).run();

    // Inserts guildConfig
    if (!guildConfig) {
      guildConfig = { id: guild.id };
      await bot.db.table("guildcfg").insert(guildConfig).run();
    }

    // If no guildConfig
    if (!req.body) return res.status(400).send({ error: "No config" });
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
      // Rolearray; has no maximum
      else if (item.type === "roleArray") guildConfig[c] = opt.filter(r => bot.guilds.get(guild.id).roles.find(rol => rol.id === r));
      // Rolearray; has maximum
      // else if (item.type === "roleArray" && item.maximum && guildConfig[c].length > item.maximum) guildConfig[c].length = item.maximum;
      else if (item.type === "roleID" && !bot.guilds.get(guild.id).roles.find(r => r.id === opt)) guildConfig[c] = null;
      else if (item.type === "bool" && typeof opt !== "boolean") guildConfig[c] = null;
      // String; has maximum
      else if (item.type === "string" && item.maximum) guildConfig[c] = opt.substring(0, 15);
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
        if (command && !command.allowdisable) return true;
        return false;
      });
    });

    // Updates the config
    await bot.db.table("guildcfg").get(guild.id).update(guildConfig).run();
    res.sendStatus(200);
  });

  return router;
};
