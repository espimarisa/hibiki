// TODO: figure out what the fuck is going on with auth system
const discordStrategy = require("passport-discord").Strategy;
const express = require("express");
const config = require("../../../config").dashboard;

const router = express.Router();
const scope = ["identify", "guilds"];

module.exports = (bot, passport) => {
  // Passport strategy
  passport.use(new discordStrategy({
    clientID: bot.user.id,
    clientSecret: config.secret,
    callbackURL: config.redirect_uri,
    scope: scope,
  }, (accessToken, refreshToken, profile, done) => {
    process.nextTick(() => {
      return done(null, profile);
    });
  }));

  // Auth routes
  router.get("/", passport.authenticate("discord", { scope: scope }));
  router.get("/callback/", passport.authenticate("discord", { failureRedirect: "/auth/fail/" }), (req, res) => {
    // this works !!!! but anywhere else? req.isAuthenticated() returns false, passport is null. the hell is this shit?
    // console.log(req.user);
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

  // Passport serialization
  // This doesn't matter where it is, it did fuckall in app and fuckall here !
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  return router;
};
