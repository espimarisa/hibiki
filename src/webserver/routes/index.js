const express = require("express");

const router = express.Router();

module.exports = (bot) => {
  router.get("/", (req, res) => {
    res.render("index");
  });

  router.get("/login/", (req, res) => {
    res.redirect(301, "/auth/");
  });

  router.get("/invite/", (req, res) => {
    res.redirect(301, `https://discordapp.com/oauth2/authorize?&client_id=${bot.user.id}&scope=bot&permissions=506850534`);
  });

  router.get("/support/", (req, res) => {
    res.redirect(301, `https://discord.gg/${bot.config.support}`);
  });

  router.get("/repo/", (req, res) => {
    res.redirect(301, "https://github.com/smolespi/Hibiki");
  });

  router.get("/vote/", (req, res) => {
    res.redirect(301, "https://top.gg/bot/493904957523623936/vote");
  });

  router.get("/twitter/", (req, res) => {
    res.redirect(301, "https://twitter.com/HibikiApp");
  });

  return router;
};
