/*
  Updates a user's bio automatically.
*/

const express = require("express");
const router = express.Router();

module.exports = (bot) => {
  router.get("/api/updateBio", async (req, res) => {
    // Sends if unauthorized
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Reads the userconfig
    let cfg = await bot.db.table("usercfg").get(req.user.id);
    // If no params
    if (!req.query || typeof req.query.bio === "undefined") return res.status(400).send({ error: "Missing required params" });
    // Sets bio
    let bio = req.query.bio;
    if (req.query.bio.length === 0 && typeof req.query.bio === "string") bio = null;
    else bio = bio.substring(0, 100);
    // Inserts blank cfg
    if (!cfg) {
      cfg = { id: req.user.id, bio: bio };
      await bot.db.table("usercfg").insert(cfg);
      res.sendStatus(200);
      return;
    }
    // Sets bio
    cfg.bio = bio;
    await bot.db.table("usercfg").get(req.user.id).update(cfg);
    res.sendStatus(200);
  });
  return router;
};
