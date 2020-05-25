/*
  Gets the logged in member's bio.
*/

const express = require("express");
const router = express.Router();

module.exports = (bot) => {
  router.get("/api/getBio", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    const cfg = await bot.db.table("usercfg").get(req.user.id);
    if (!cfg || !cfg.bio) return res.status(404).send({ error: "No bio" });
    res.send(cfg.bio);
  });

  return router;
};
