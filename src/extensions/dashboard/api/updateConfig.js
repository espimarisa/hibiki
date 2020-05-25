/*
  Updates a server's config.
*/

const express = require("express");
const items = require("../../../lib/utils/ValidItems");
const router = express.Router();

module.exports = bot => {
  router.post("/api/updateconfig/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Looks for managable guilds
    const managableguilds = req.user.guilds.filter(g => (g.permissions & 32) === 32);
    if (!managableguilds.find(g => g.id === req.params.id)) return res.status(403).send({ error: "No access to guild" });
    let cfg = await bot.db.table("guildcfg").get(req.params.id);

    // Inserts cfg
    if (!cfg) {
      cfg = { id: req.params.id };
      await bot.db.table("guildcfg").insert(cfg);
    }

    if (!req.body) return res.status(400).send({ error: "No config" });
    cfg = req.body;

    // Each cfg type/option
    Object.keys(cfg).forEach(c => {
      if (c === "id") return;
      const opt = cfg[c];
      if (!opt) return;

      // Finds the items
      const item = items.find(i => i.id === c);
      if (!item) return delete cfg[c];

      // Number type; has no maximum or minimum
      if (item.type === "number" && typeof opt !== "number") delete cfg[c];
      // Number type; has maximum
      else if (item.type === "number" && item.maximum && opt > item.maximum) cfg[c] = item.maximum;
      // Number type; has minimum
      if (item.type === "number" && item.minimum && opt < item.minimum) cfg[c] = item.minimum;
      if (item.type === "punishment") cfg[c] = opt.filter(p => ["Purge", "Warn", "Mute"].includes(p));
      if (item.type === "channelID" && !bot.guilds.get(req.params.id).channels.find(channel => channel.id === opt)) cfg[c] = null;
      // Channelarray
      if (item.type === "channelArray") cfg[c] = opt.filter(c => bot.guilds.get(req.params.id).channels.find(channel => channel.id === c));
      // Rolearray; has no maximum
      if (item.type === "roleArray") cfg[c] = opt.filter(r => bot.guilds.get(req.params.id).roles.find(rol => rol.id === r));
      // Rolearray; has maximum
      if (item.type === "roleArray" && item.maximum && cfg[c].length > item.maximum) cfg[c].length = item.maximum;
      if (item.type === "roleID" && !bot.guilds.get(req.params.id).roles.find(r => r.id === opt)) cfg[c] = null;
      if (item.type === "bool" && typeof opt !== "boolean") cfg[c] = null;
      // String; has maximum
      if (item.type === "string" && item.maximum) cfg[c] = opt.substring(0, 15);
      // String; has minimum
      if (item.type === "string" && item.minimum && opt.length < item.minimum) cfg[c] = null;
      if (item.type === "array" && !Array.isArray(cfg[c])) return cfg[c] = null;
      // Valid emoji regex
      if (item.type === "emoji" && !/\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/.test(cfg[c])) delete cfg[c];

      // Disabled categories
      if (c === "disabledCategories") {
        const categories = [];

        // Ignores owner; pushes cmds
        bot.commands.forEach(c => {
          if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category);
        });

        // Filters cfg
        cfg[c] = cfg[c].filter(cat => categories.includes(cat));
      }

      // Disabled commands
      if (c === "disabledCmds") cfg[c] = cfg[c].filter(cmd => {
        const command = bot.commands.get(cmd);
        if (command && !command.allowdisable) return true;
        return false;
      });
    });

    // Updates the config
    cfg.id = req.params.id;
    await bot.db.table("guildcfg").get(req.params.id).update(cfg);
    res.sendStatus(200);
  });

  return router;
};
