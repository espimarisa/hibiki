/**
 * @file Index routes
 * @description Routings for the index page and it's redirects
 * @module dashboard/routes/index
 */

import type { Profile } from "passport-discord";
import type { HibikiClient } from "../../classes/Client";
import { defaultAvatar } from "../../helpers/constants";
import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();

// Ratelimit for index requests. Very loose, but it's here just in case some idiot tries to spam getAuthedUser.
const indexAuthLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: "Too many requests in the past minute. Try again later.",
});

export = (bot: HibikiClient) => {
  // Gets authed user's info
  const getAuthedUser = (user: Profile) => ({
    username: user.username,
    discriminator: user.discriminator,
    guilds: user.guilds,
    id: user.id,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : defaultAvatar,
  });

  router.get("/", indexAuthLimit, (req, res) => {
    res.render("index", {
      bot: bot,
      page: req.url,
      user: req.isAuthenticated() ? getAuthedUser(req.user as Profile) : null,
    });
  });

  // Login redirection
  router.get("/login/", (req, res) => {
    res.redirect(301, "/auth/");
  });

  // Logout redirection
  router.get("/logout/", (req, res) => {
    res.redirect(301, "/auth/logout");
  });

  // Donate redirection
  router.get("/donate/", (req, res) => {
    res.redirect(301, `https://ko-fi.com/smolespi`);
  });

  // Invite redirection
  router.get("/invite/", (req, res) => {
    res.redirect(301, `https://discordapp.com/oauth2/authorize?&client_id=${bot.user.id}&scope=bot&permissions=506850534`);
  });

  // Support redirection
  router.get("/support/", (req, res) => {
    res.redirect(301, "https://discord.gg/gZEj4sM");
  });

  // GitHub redirection
  router.get("/github/", (req, res) => {
    res.redirect(301, "https://github.com/smolespi/hibiki");
  });

  // Privacy redirection
  router.get("/privacy/", (req, res) => {
    res.redirect(301, "https://github.com/smolespi/hibiki/blob/main/.github/PRIVACY_POLICY.md");
  });

  // Voting redirection
  router.get("/vote/", (req, res) => {
    res.redirect(301, "https://top.gg/bot/493904957523623936/vote");
  });

  return router;
};
