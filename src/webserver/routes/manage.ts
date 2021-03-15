/**
 * @file Manage routes
 * @description Routings for server and profile management
 * @module webserver/routes/manage
 */

import type { Profile } from "passport-discord";
import type { HibikiClient } from "../../classes/Client";
import { checkAuth, getAuthedUser, getManagableGuilds } from "../../utils/auth";
import { localizeProfileItems, localizeSetupItems } from "../../utils/format";
import { validItems } from "../../utils/validItems";
import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();
const localeNames = {};

const manageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests in a short period of time. Try again later.",
});

export function manageRoutes(bot: HibikiClient) {
  Object.keys(bot.localeSystem.locales).forEach((locale) => {
    localeNames[locale] = bot.localeSystem.getLocale(locale, "NAME");
  });

  // List of servers
  router.get("/servers/", manageRateLimit, checkAuth, (req, res) => {
    const user = getAuthedUser(req.user as Profile);
    res.render("servers", {
      bot: bot,
      page: req.url.split("/")[1],
      user: user,
      nonce: res.locals.nonce,
    });
  });

  // Profile manager
  router.get("/profile/", manageRateLimit, checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user as Profile);
    const userConfig = await bot.db.getUserConfig(user.id);
    const localeString = bot.localeSystem.getLocaleFunction(userConfig?.locale ? userConfig?.locale : bot.config.defaultLocale);
    const localizeItem = (item: string, title = false) => localizeProfileItems(localeString, item, title);

    res.render("profile", {
      bot: bot,
      cfg: userConfig,
      items: validItems,
      page: req.url.split("/")[1],
      user: user,
      csrfToken: req.csrfToken(),
      localeString: localeString,
      localizeItem: localizeItem,
      locales: localeNames,
      nonce: res.locals.nonce,
    });
  });

  // Server manager
  router.get("/:id", manageRateLimit, checkAuth, async (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).render("401");
    }

    // Checks to see if the user has permission to manage the guild
    const user = getAuthedUser(req.user as Profile);
    const guild = getManagableGuilds(req, user as Profile, bot.guilds);
    if (!guild) return res.status(401).send({ error: "Unauthorized to manage this guild." });

    // Gets the user's config, locale info, and guildConfig
    const userConfig = await bot.db.getUserConfig(user.id);
    const guildConfig = await bot.db.getGuildConfig(guild.id);
    const localeString = bot.localeSystem.getLocaleFunction(userConfig?.locale ? userConfig.locale : bot.config.defaultLocale);
    const localizeItem = (item: string, title = false, punishment = false) => localizeSetupItems(localeString, item, title, punishment);

    res.render("manage", {
      guild: guild,
      bot: bot,
      cfg: guildConfig,
      items: validItems,
      page: "manage",
      user: user,
      csrfToken: req.csrfToken(),
      localizeItem: localizeItem,
      locales: localeNames,
      nonce: res.locals.nonce,
    });
  });

  return router;
}
