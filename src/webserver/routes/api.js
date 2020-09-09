/**
 * @fileoverview Dashboard API
 * @description Handles any API routes and requests
 * @param {Object} bot Main bot object
 */

const express = require("express");
const router = express.Router();

module.exports = bot => {
  // Gets a user's bio
  router.get("/getBio", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "401" });
    const cfg = await bot.db.table("usercfg").get(req.user.id).run();
    if (!cfg || !cfg.bio) return res.status(404).send({ error: "404" });
    res.send(cfg.bio);
  });

  // Updates a user's bio
  router.get("/updateBio", async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "401" });
    let cfg = await bot.db.table("usercfg").get(req.user.id).run();
    if (!req.query || typeof req.query.bio === "undefined") return res.status(400).send({ error: "400" });
    let bio = req.query.bio;
    if (req.query.bio.length === 0 && typeof req.query.bio === "string") bio = null;
    else bio = bio.substring(0, 120);

    if (!cfg) {
      cfg = { id: req.user.id, bio: bio };
      await bot.db.table("usercfg").insert(cfg).run();
      return res.sendStatus(200);
    }

    cfg.bio = bio;
    await bot.db.table("usercfg").get(req.user.id).update(cfg).run();
    res.sendStatus(200);
  });

  router.get("getItems", async (req, res) => {
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
    res.status(200).send(require("../../utils/items"));
  });

  return router;
};
