const express = require("express");
// const fetch = require("node-fetch");

const router = express.Router();

module.exports = (bot) => {
  // Checks if user is authenticated
  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    return res.redirect("../../auth/");
  };

  // Gets authed user's data
  const getAuthedUser = user => ({
    username: user.username,
    discriminator: user.discriminator,
    guilds: userGuilds,
    id: user.id,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
  });

  // // Gets a user's guilds
  // async function userGuilds(user) {
  //   const guilds = await fetch("https://discord.com/api/users/@me/guilds", {
  //     headers: {
  //       Authorization: `Bearer ${user.accessToken}`,
  //     },
  //   }).then(async res => await res.json());

  //   return guilds;
  // }

  // Renders list of servers
  router.get("/servers/", checkAuth, async (req, res) => {
    // const guilds = await userGuilds(req.user);
    // console.log(guilds);
    // if (guilds.message && guilds.message !== "You are being rate limited.") return res.status(401).redirect("../../auth/");
    // else if (guilds.message && guilds.message === "You are being rate limited.") return res.status(429).redirect("../../auth/ratelimited");
    res.render("servers", { bot: bot, user: req.user });
  });

  // todo: better ratelimit handler on shit
  // Renders server manager
  router.get("/:id", checkAuth, async (req, res) => {
    // Sets vaild items
    const items = require("../../utils/items");
    if (!req.isAuthenticated()) { res.status(401).render("401"); }
    // User & guild perms
    const user = getAuthedUser(req.user);
    const guilds = await userGuilds(req.user);
    // Redirects if failed to fetch guilds
    if (guilds.message && guilds.message !== "You are being rate limited.") return res.status(401).redirect("../../auth/");
    else if (guilds.message && guilds.message === "You are being rate limited.") return res.status(429).redirect("../../auth/ratelimited");
    const managableGuilds = userGuilds.filter(g => (g.permissions & 32) === 32 && bot.guilds.get(g.id));
    const guild = managableGuilds.find(g => g.id === req.params.id);
    // Renders the dashboard page
    if (!guild) return res.status(403).render("403");
    const cfg = await bot.db.table("guildcfg").get(guild.id).run();
    res.render("manage", { guild: guild, bot: bot, cfg: cfg, items: items, user: user });
  });

  return router;
};
