/**
 * @file Manage routes
 * @description Routings for server and profile management
 * @module webserver/routes/manage
 */

import type { Profile } from "passport-discord";
import type { HibikiClient } from "../../classes/Client";
import { defaultAvatar } from "../../utils/constants";
import { checkAuth, getAuthedUser, getManagableGuilds, getWebLocale } from "../../utils/webserver";
import { localizeProfileItems, localizeSetupItems } from "../../utils/format";
import { validItems } from "../../utils/validItems";
import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();
const localeNames = {};
const itemLocales = {};
const itemLocalesTitle = {};
const itemLocalesPunishment = {};

const manageRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many requests in a short period of time. Try again later.",
});

export function manageRoutes(bot: HibikiClient) {
  // Gets each locale name; localizes setup and profile items
  Object.keys(bot.localeSystem.locales).forEach((locale) => {
    localeNames[locale] = bot.localeSystem.getLocale(locale, "NAME");
    itemLocales[locale] = {};
    itemLocalesTitle[locale] = {};
    itemLocalesPunishment[locale] = {};
    const localeFunction = bot.localeSystem.getLocaleFunction(locale);
    validItems.forEach((item) => {
      if (item.category !== "profile") {
        itemLocales[locale][item.id] = localizeSetupItems(localeFunction, item.id);
        itemLocalesTitle[locale][item.id] = localizeSetupItems(localeFunction, item.id, true);
        itemLocalesPunishment[locale][item.id] = localizeSetupItems(localeFunction, item.id, false, true);
      } else {
        itemLocales[locale][item.id] = localizeProfileItems(localeFunction, item.id);
        itemLocalesTitle[locale][item.id] = localizeProfileItems(localeFunction, item.id, true);
      }
    });
  });

  // List of servers
  router.get("/servers/", manageRateLimit, checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user as Profile);
    const userConfig = await bot.db.getUserConfig(user.id);
    const locale = userConfig?.locale || bot.config.defaultLocale;

    // Finds guilds the user can manage
    const managableGuilds = user.guilds
      .map((g) => ({
        permissions: g.permissions,
        name: g.name,
        id: g.id,
        isIn: bot.guilds.has(g.id),
        icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=64` : defaultAvatar,
      }))
      .filter((g) => (g.permissions & 32) === 32 || ((g.permissions & 8) === 8 && g.isIn))
      .sort((a, b) => (a.name > b.name ? 1 : -1))
      .sort((g) => (g.isIn ? -1 : 0))
      .sort((a, b) => (a.isIn && a.name < b.name ? -1 : 0));

    res.render("servers", {
      bot: bot,
      botAvatar: bot.user.dynamicAvatarURL(null, 128),
      guilds: managableGuilds,
      locales: getWebLocale(bot, locale),
      nonce: res.locals.nonce,
      page: req.url.split("/")[1],
      user: user,
    });
  });

  // Profile manager
  router.get("/profile/", manageRateLimit, checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user as Profile);
    const userConfig = await bot.db.getUserConfig(user.id);
    const locale = userConfig?.locale || bot.config.defaultLocale;

    res.render("profile", {
      bot: bot,
      botAvatar: bot.user.dynamicAvatarURL(null, 128),
      cfg: userConfig,
      csrfToken: req.csrfToken(),
      itemLocales: itemLocales[locale],
      itemLocalesTitle: itemLocalesTitle[locale],
      items: validItems.filter((item) => item.category === "profile"),
      localeNames: localeNames,
      locales: getWebLocale(bot, locale),
      localesKeys: Object.keys(localeNames),
      nonce: res.locals.nonce,
      page: req.url.split("/")[1],
      pronouns: ["NO_PREFERENCE", "PRONOUNS_HE", "PRONOUNS_SHE", "PRONOUNS_THEY"],
      user: user,
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
    if (!guild) return res.status(401).redirect("servers");

    // Gets the user's config, locale info, and guildConfig
    const userConfig = await bot.db.getUserConfig(user.id);
    const guildConfig = await bot.db.getGuildConfig(guild.id);
    const locale = userConfig?.locale || bot.config.defaultLocale;

    // Gets channels
    const channels = bot.guilds
      .get(guild.id)
      .channels?.map((c) => ({ name: c.name, id: c.id, type: c.type }))
      .filter((c) => c.type === 0 && bot.guilds.get(guild.id).channels?.get(c.id).permissionsOf(bot.user.id).has("sendMessages"));

    // Gets voice channels
    const voiceChannels = bot.guilds
      .get(guild.id)
      .channels?.map((c) => ({ name: c.name, id: c.id, type: c.type }))
      .filter((c) => c.type === 2 && bot.guilds.get(guild.id).channels?.get(c.id).permissionsOf(bot.user.id).has("voiceSpeak"));

    // Gets roles
    const roles = bot.guilds
      .get(guild.id)
      .roles.map((r) => ({ name: r.name, managed: r.managed, color: r.color.toString(16), id: r.id }))
      .filter((r) => r.managed !== true && r.name !== "@everyone");

    // Category font awesome icons
    const itemCategories = {};
    const categoryInfo = {};
    function categoryIcon(category: string) {
      switch (category) {
        case "features":
          return "cog";
        case "automod":
          return "hammer";
        case "logging":
          return "scroll";
        case "greeting":
          return "users";
        case "pinboard":
          return "thumbtack";
        case "sniping":
          return "comment-slash";
        case "roles":
          return "user-tag";
        case "music":
          return "music";
      }
    }

    // Gets valid items and pushes the info, description, and icon
    validItems.forEach((item) => {
      if (item.category === "profile" || item.id === "disabledCategories") return;
      if (itemCategories[item.category]) itemCategories[item.category].push(item);
      else {
        itemCategories[item.category] = [item];
        categoryInfo[item.category] = {
          // Localizes the item title and description
          title: bot.localeSystem.getLocale(locale, `web.MANAGE_${item.category.toUpperCase()}_TITLE` as any),
          description: bot.localeSystem.getLocale(locale, `web.MANAGE_${item.category.toUpperCase()}_DESCRIPTION` as any),
          icon: categoryIcon(item.category),
        };
      }
    });

    res.render("manage", {
      bot: bot,
      botAvatar: bot.user.dynamicAvatarURL(null, 128),
      categories: Object.keys(itemCategories),
      categoryInfo: categoryInfo,
      cfg: guildConfig,
      channels: channels,
      csrfToken: req.csrfToken(),
      guild: guild,
      guildIcon: guild.icon ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=256` : defaultAvatar,
      itemCategories: itemCategories,
      itemLocales: itemLocales[locale],
      itemLocalesPunishment: itemLocalesPunishment[locale],
      itemLocalesTitle: itemLocalesTitle[locale],
      items: validItems.filter((item) => item.category !== "profile" && item.id !== "disabledCategories"),
      localeNames: localeNames,
      locales: getWebLocale(bot, locale),
      localesKeys: Object.keys(localeNames),
      nonce: res.locals.nonce,
      page: "manage",
      roles: roles,
      user: user,
      voiceChannels: voiceChannels,
    });
  });

  return router;
}
