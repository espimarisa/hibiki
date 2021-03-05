/**
 * @file Manage routes
 * @description Routings for server and profile management
 * @module dashboard/routes/manage
 */

import type { HibikiClient } from "../../classes/Client";
import type { NextFunction, Request, Response } from "express";
import type { GuildInfo, Profile } from "passport-discord";
import { localizeProfileItems, localizeSetupItems } from "../../utils/format";
import { defaultAvatar } from "../../helpers/constants";
import { validItems } from "../../utils/validItems";
import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();

// Ratelimit for manage requests. 20 requests per minute.
const manageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: "Too many manage requests in the past minute. Try again later.",
});

export = (bot: HibikiClient) => {
  const checkAuth = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) return next();
    return res.redirect(301, "../../auth/");
  };

  const localeNames = {};
  Object.keys(bot.localeSystem.locales).forEach((locale) => {
    localeNames[locale] = bot.localeSystem.getLocale(locale, "NAME");
  });

  // Gets authed user's info
  const getAuthedUser = (user: Profile) => ({
    username: user.username,
    discriminator: user.discriminator,
    guilds: user.guilds,
    id: user.id,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : defaultAvatar,
  });

  // List of servers
  router.get("/servers/", manageRateLimit, checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user as Profile);
    res.render("servers", { bot: bot, page: req.url.split("/")[1], user: user });
  });

  // Profile manager
  router.get("/profile/", manageRateLimit, checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user as Profile);
    const userconfig = await bot.db.getUserConfig(user.id);
    const localeString = bot.localeSystem.getLocaleFunction(userconfig?.locale ? userconfig?.locale : bot.config.defaultLocale);
    const localizeItem = (item: string, title = false) => localizeProfileItems(localeString, item, title);

    res.render("profile", {
      bot: bot,
      cfg: userconfig,
      items: validItems,
      page: req.url.split("/")[1],
      user: user,
      csrfToken: req.csrfToken(),
      localeString: localeString,
      localizeItem: localizeItem,
      locales: localeNames,
    });
  });

  // Server manager
  router.get("/:id", manageRateLimit, checkAuth, async (req, res) => {
    if (!req.isAuthenticated()) {
      res.status(401).render("401");
    }

    const user = getAuthedUser(req.user as Profile);
    const managableGuilds = user.guilds.filter(
      (g: GuildInfo) => (g.permissions & 32) === 32 || ((g.permissions & 8) === 8 && bot.guilds.get(g.id)),
    );

    const guild = managableGuilds.find((g: GuildInfo) => g.id === req.params.id);

    // Renders the dashboard and sends the config
    if (!guild) return res.status(401).render("401");
    const userConfig = await bot.db.getUserConfig(user.id);

    const localeString = bot.localeSystem.getLocaleFunction(userConfig?.locale ? userConfig.locale : bot.config.defaultLocale);
    const localizeItem = (item: string, title = false, punishment = false) => localizeSetupItems(localeString, item, title, punishment);
    const cfg = await bot.db.getGuildConfig(guild.id);
    res.render("manage", {
      guild: guild,
      bot: bot,
      cfg: cfg,
      items: validItems,
      page: "manage",
      user: user,
      csrfToken: req.csrfToken(),
      localizeItem: localizeItem,
      locales: localeNames,
    });
  });

  return router;
};
