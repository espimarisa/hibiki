/*
  This sends cmds and items thru the API.
*/

const express = require("express");
const router = express.Router();

module.exports = (bot) => {
  router.get("/api/getitems", async (req, res) => {
    // Sends if unauthorised
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
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
    // Sends db items
    res.status(200).send(require("../static/items"));
  });
  return router;
};
