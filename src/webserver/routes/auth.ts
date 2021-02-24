/**
 * @file Auth routes
 * @description Routings for Discord authentication
 * @module dashboard/routes/auth
 */

import type { HibikiClient } from "../../classes/Client";
import type { Request } from "express";
import { Strategy } from "passport-discord";
import express from "express";
import passport from "passport";
import rateLimit from "express-rate-limit";

const router = express.Router();
const scope = ["identify", "guilds"];

// Destroys a session
const destroySession = (req: Request) => new Promise<void>((rs, rj) => req.session.destroy((e) => (e ? rj(e) : rs())));

// Ratelimit for auth requests. 5 requests per minute.
const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 5,
  message: "Too many authorization or deauthorization attempts in the past minute. Try again later.",
});

export = (bot: HibikiClient) => {
  // Create a Discord passport
  passport.use(
    new Strategy(
      {
        clientID: bot.user.id,
        clientSecret: bot.config.dashboard.botSecret,
        callbackURL: bot.config.dashboard.redirectURI,
        scope: scope,
      },
      (_accessToken, _refreshToken, profile, done) => {
        process.nextTick(() => {
          return done(null, profile);
        });
      },
    ),
  );

  // Authentication routes
  router.get("/", authRateLimit, passport.authenticate("discord", { scope: scope }));
  router.get("/callback/", authRateLimit, passport.authenticate("discord", { failureRedirect: "/auth/fail/" }), (_req, res) => {
    res.redirect(301, "../manage/servers/");
  });

  // Logs the authed user out
  router.get("/logout/", authRateLimit, async (req, res) => {
    await destroySession(req).then(() => {
      res.redirect(301, "/");
    });
  });

  // Login fail page; destroys the session
  router.get("/fail/", authRateLimit, async (req, res) => {
    await destroySession(req).then(() => {
      res.render("authfail");
    });
  });

  // Ratelimited page; destroys the session
  router.get("/ratelimited/", authRateLimit, async (req, res) => {
    await destroySession(req).then(() => {
      res.render("429");
    });
  });

  // Passport serialization
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  return router;
};
