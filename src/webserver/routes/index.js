const express = require("express");
const format = require("../../utils/format");

const router = express.Router();

module.exports = bot => {
  // Gets authed user data
  const getAuthedUser = user => ({
    username: user.username,
    discriminator: user.discriminator,
    guilds: user.guilds,
    id: user.id,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
  });

  router.get("/", (req, res) => {
    res.render("index", {
      bot: bot,
      format: format,
      page: req.url,
      user: req.isAuthenticated() ? getAuthedUser(req.user) : null,
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

  router.get("/support/", (req, res) => {
    res.redirect(301, "https://discord.gg/gZEj4sM");
  });

  router.get("/github/", (req, res) => {
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
