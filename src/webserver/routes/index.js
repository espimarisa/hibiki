const express = require("express");
const format = require("../../utils/format");

const router = express.Router();

module.exports = (bot) => {
  router.get("/", (req, res) => {
    res.render("index", {
      bot: bot,
      format: format,
    });
  });

  router.get("/login/", (req, res) => {
    res.redirect(301, "/auth/");
  });

  router.get("/logout/", (req, res) => {
    res.redirect(301, "/auth/logout");
  });

  router.get("/invite/", (req, res) => {
    res.redirect(301, `https://discordapp.com/oauth2/authorize?&client_id=${bot.user.id}&scope=bot&permissions=506850534`);
  });

  router.get("/support/" || router.get("/discord"), (req, res) => {
    res.redirect(301, `https://discord.gg/${bot.config.support}`);
  });

  router.get("/github/" || router.get("/repo/"), (req, res) => {
    res.redirect(301, "https://github.com/smolespi/Hibiki");
  });

  router.get("/privacy/", (req, res) => {
    res.redirect(301, "https://github.com/smolespi/Hibiki/blob/main/.github/PRIVACY_POLICY.md");
  });

  router.get("/vote/", (req, res) => {
    res.redirect(301, "https://top.gg/bot/493904957523623936/vote");
  });

  router.get("/twitter/", (req, res) => {
    res.redirect(301, "https://twitter.com/HibikiApp");
  });

  return router;
};
