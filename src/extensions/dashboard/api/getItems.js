/*
  Item Loader
  This sends cmds and items thru the API.
*/

let express = require("express");
let router = express.Router();

module.exports = (bot) => {
  router.get("/api/getitems", async (req, res) => {
    // Sends if unauthorised
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized" });
    // Sends loaded cmds
    if (req.query.commands) {
      let cmds = [];
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
    res.status(200).send(require("../../../lib/utils/ValidItems"));
  });
  return router;
};

module.exports.extload = false;
