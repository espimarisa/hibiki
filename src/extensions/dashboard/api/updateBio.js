/*
  Updates a user's bio.
*/

const express = require("express");
const router = express.Router();

module.exports = (bot) => {
  router.get("/api/updateBio", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Gets userconfig
    let cfg = await bot.db.table("usercfg").get(req.user.id);
    if (!req.query || typeof req.query.bio === "undefined") return res.status(400).send({ error: "Missing required params" });
    // Sets bio
    let bio = req.query.bio;
    if (req.query.bio.length === 0 && typeof req.query.bio === "string") bio = null;
    else bio = bio.substring(0, 100);

    // Inserts cfg
    if (!cfg) {
      cfg = { id: req.user.id, bio: bio };
      await bot.db.table("usercfg").insert(cfg);
      return res.sendStatus(200);
    }

    // Updates cfg
    cfg.bio = bio;
    await bot.db.table("usercfg").get(req.user.id).update(cfg);
    res.sendStatus(200);
  });
  return router;
};
