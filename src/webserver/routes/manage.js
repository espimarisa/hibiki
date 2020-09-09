const express = require("express");
const items = require("../../utils/items");

const router = express.Router();

module.exports = bot => {
  // Checks if user is authenticated
  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect(301, "../../auth/");
  };

  // Gets authed user's info
  const getAuthedUser = user => ({
    username: user.username,
    discriminator: user.discriminator,
    guilds: user.guilds,
    id: user.id,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
  });

  // List of servers
  router.get("/servers/", checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user);
    res.render("servers", { bot: bot, page: req.url.split("/")[1], user: user });
  });

  // Profile manager
  router.get("/profile/", checkAuth, async (req, res) => {
    const user = getAuthedUser(req.user);
    const usercfg = await bot.db.table("usercfg").get(user.id).run();
    res.render("profile", { bot: bot, cfg: usercfg, page: req.url.split("/")[1], user: user });
  });

  // Server manager
  router.get("/:id", checkAuth, async (req, res) => {
    if (!req.isAuthenticated()) { res.status(401).render("401"); }
    // User & guild perms
    const user = getAuthedUser(req.user);
    const managableguilds = user.guilds.filter(g => (g.permissions & 32) === 32 || (g.permissions & 8) === 8 && bot.guilds.get(g.id));
    const guild = managableguilds.find(g => g.id === req.params.id);
    // Renders the dashboard
    if (!guild) return res.status(403).render("403");
    const cfg = await bot.db.table("guildcfg").get(guild.id).run();
    res.render("manage.ejs", { guild: guild, bot: bot, cfg: cfg, items: items, page: "manage", user: user });
  });

  return router;
};
