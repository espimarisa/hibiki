/*
  Config Loader
  Gets the guildcfg of a server.
*/

let express = require("express");
let router = express.Router();

module.exports = bot => {
  router.get("/api/getconfig/:id", async (req, res) => {
    // Sends if unauthorised
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Looks for managable guilds
    let managableguilds = req.user.guilds.filter(g => (g.permissions & 32) === 32);
    // If no perms to guild
    if (!managableguilds.find(g => g.id === req.params.id)) return res.status(403).send({ error: "No access to guild" });
    // Reads the guildcfg
    let cfg = await bot.db.table("guildcfg").get(req.params.id);
    if (!cfg) return res.status(404).send({ error: "No config" });
    // Sends cfg
    res.send(cfg);
  });
  return router;
};

module.exports.extload = false;