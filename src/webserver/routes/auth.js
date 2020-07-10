const discordStrategy = require("passport-discord").Strategy;
const express = require("express");
const passport = require("passport");
const config = require("../../../config").dashboard;

const router = express.Router();
const scope = ["identify", "guilds"];

module.exports = (bot) => {
  // Gets authed user's data
  const getAuthedUser = user => ({
    username: user.username,
    discriminator: user.discriminator,
    guilds: user.guilds,
    id: user.id,
    avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
  });

  // Passport strategy
  passport.use(new discordStrategy({
    clientID: bot.user.id,
    clientSecret: config.secret,
    callbackURL: config.redirect_uri,
    scope: ["identify, guilds"],
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      return done(null, profile);
    });
  }));

  // Auth routes
  router.get("/", passport.authenticate("discord", { scope: scope }));
  router.get("/callback/", passport.authenticate("discord", { failureRedirect: "/auth/fail/" }), (req, res) => {
    console.log(req.user);
    res.redirect("../manage/servers/");
  });

  // Logs the authed user out
  router.get("/logout/", (req, res) => {
    res.clearCookie(`${bot.user.username}`, { path: "../" });
    res.clearCookie(`${bot.user.username}.sig`, { path: "../" });
    req.logout();
    req.session = null;
    res.redirect("../../");
  });

  // Login fail page; destroys the session
  router.get("/fail/", (req, res) => {
    res.clearCookie(`${bot.user.username}`, { path: "../" });
    res.clearCookie(`${bot.user.username}.sig`, { path: "../" });
    req.logout();
    req.session = null;
    res.render("authfail");
  });

  // Login fail page; destroys the session
  router.get("/ratelimited/", (req, res) => {
    res.clearCookie(`${bot.user.username}`, { path: "../" });
    res.clearCookie(`${bot.user.username}.sig`, { path: "../" });
    req.logout();
    req.session = null;
    res.render("429");
  });

  // bodyParser & passport serialization
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  return router;
};
