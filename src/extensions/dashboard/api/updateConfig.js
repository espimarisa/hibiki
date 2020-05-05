/*
  Updates a server config.
*/

const express = require("express");
const router = express.Router();
const items = require("../static/items");

module.exports = bot => {
  router.post("/api/updateconfig/:id", async (req, res) => {
    // If user unauthorized
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Looks for managable guilds
    const managableguilds = req.user.guilds.filter(g => (g.permissions & 32) === 32);
    // If no perms to guild
    if (!managableguilds.find(g => g.id === req.params.id)) return res.status(403).send({ error: "No access to guild" });
    // Reads the guildcfg
    let cfg = await bot.db.table("guildcfg").get(req.params.id);

    // Inserts blank cfg
    if (!cfg) {
      cfg = { id: req.params.id };
      await bot.db.table("guildcfg").insert(cfg);
    }

    // If no cfg
    if (!req.body) return res.status(400).send({ error: "No config" });
    cfg = req.body;

    // Each cfg type/option
    Object.keys(cfg).forEach(c => {
      if (c === "id") return;
      const opt = cfg[c];
      if (!opt) return;
      const item = items.find(i => i.id === c);
      // Deletes if invalid
      if (!item) return delete cfg[c];
      // Number types
      if (item.type === "number" && typeof opt !== "number") delete cfg[c];
      else if (item.type === "number" && item.maximum && opt > item.maximum) cfg[c] = item.maximum;
      if (item.type === "number" && item.minimum && opt < item.minimum) cfg[c] = item.minimum;
      // Punishment types
      if (item.type === "punishment") cfg[c] = opt.filter(p => ["Purge", "Strike", "Mute"].includes(p));
      // If channel doesn't exist
      if (item.type === "channelID" && !bot.guilds.get(req.params.id).channels.find(channel => channel.id === opt)) cfg[c] = null;
      // Role cfgs
      if (item.type === "roleArray") cfg[c] = opt.filter(r => bot.guilds.get(req.params.id).roles.find(rol => rol.id === r));
      if (item.type === "roleArray" && item.maximum && cfg[c].length > item.maximum) cfg[c].length = item.maximum;
      if (item.type === "roleID" && !bot.guilds.get(req.params.id).roles.find(r => r.id === opt)) cfg[c] = null;
      // Booleans & strings
      if (item.type === "bool" && typeof opt !== "boolean") cfg[c] = null;
      if (item.type === "string" && item.maximum) cfg[c] = opt.substring(0, 15);
      if (item.type === "string" && item.minimum && opt.length < item.minimum) cfg[c] = null;
      // Disabled commands/categories
      if (item.type === "array" && !Array.isArray(cfg[c])) return cfg[c] = null;
      if (c === "disabledCategories") {
        const categories = [];
        bot.commands.forEach(c => {
          if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category);
        });
        cfg[c] = cfg[c].filter(cat => categories.includes(cat));
      }
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
