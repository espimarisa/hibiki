/*
  Bio Loader
  Gets the logged in user's bio.
*/

let express = require("express");
let router = express.Router();

module.exports = (bot) => {
  router.get("/api/getBio", async (req, res) => {
    // Sends if unauthorised
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Looks for usercfg
    let cfg = await bot.db.table("usercfg").get(req.user.id);
    if (!cfg || !cfg.bio) return res.status(404).send({ error: "No bio" });
    // Sends cfg
    res.send(cfg.bio);
  });
  return router;
};

module.exports.extload = false;