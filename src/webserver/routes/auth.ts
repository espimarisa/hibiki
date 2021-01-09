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
import config from "../../../config.json";
const router = express.Router();
const scope = ["identify", "guilds"];

// Destroys a session
const destroySession = (req: Request) => new Promise<void>((rs, rj) => req.session.destroy((e) => (e ? rj(e) : rs())));

export = (bot: HibikiClient) => {
  // Create a Discord passport
  passport.use(
    new Strategy(
      {
        clientID: bot.user.id,
        clientSecret: config.dashboard.secret,
        callbackURL: config.dashboard.redirectURI,
        scope: scope,
      },
      (accessToken, refreshToken, profile, done) => {
        process.nextTick(() => {
          return done(null, profile);
        });
      },
    ),
  );

  // Authentication routes
  router.get("/", passport.authenticate("discord", { scope: scope }));
  router.get("/callback/", passport.authenticate("discord", { failureRedirect: "/auth/fail/" }), (req, res) => {
    res.redirect(301, "../manage/servers/");
  });

  // Logs the authed user out
  router.get("/logout/", async (req, res) => {
    await destroySession(req).then(() => {
      res.redirect(301, "/");
    });
  });

  // Login fail page; destroys the session
  router.get("/fail/", async (req, res) => {
    await destroySession(req).then(() => {
      res.render("authfail");
    });
  });

  // Ratelimited page; destroys the session
  router.get("/ratelimited/", async (req, res) => {
    await destroySession(req).then(() => {
      res.render("429");
    });
  });

  // Passport serialization
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  return router;
};
