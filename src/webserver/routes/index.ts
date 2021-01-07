/**
 * @file Index routes
 * @description Routings for the index page and it's redirects
 * @module dashboard/routes/index
 */

import type { HibikiClient } from "classes/Client";
import express from "express";
const router = express.Router();

export = (bot: HibikiClient) => {
  router.get("/", (req, res) => {
    res.render("index", {
      bot: bot,
      page: req.url,
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
