/**
 * @file Auth routes
 * @description Routings for Discord authentication
 * @module webserver/routes/auth
 */

import type { User } from "eris";
import type { StrategyOptions } from "passport-discord";
import { Strategy } from "passport-discord";
import { destroySession } from "../../utils/auth";
import express from "express";
import rateLimit from "express-rate-limit";
import passport from "passport";
import config from "../../../config.json";
const scope = ["identify", "guilds"];
const router = express.Router();

const authRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 15,
  message: "Too many attempts to authenticate or deauthenticate in a short period of time. Try again later",
});

export function authRoutes(user: User) {
  // oAuth options
  const strategyOptions: StrategyOptions = {
    clientID: user.id,
    clientSecret: config.dashboard.botSecret,
    callbackURL: config.dashboard.redirectURI,
    scope: scope,
  };

  // Create a Discord passport
  passport.use(
    new Strategy(strategyOptions, (_accessToken, _refreshToken, profile, done) => {
      process.nextTick(() => {
        return done(null, profile);
      });
    }),
  );

  // Authentication routes
  router.get("/", passport.authenticate("discord", { scope: scope }));
  router.get(
    "/callback/",
    authRateLimit,
    passport.authenticate("discord", { failureRedirect: "/auth/fail/", successRedirect: "/manage/servers/" }),
  );

  // Logout handler; destroys the session
  router.get("/logout/", authRateLimit, async (req, res) => {
    await destroySession(req)
      .then(() => {
        res.redirect(301, "/");
      })
      .catch(() => {
        res.status(500).send({ error: "Failed to destroy the session data. Try clearing your cookies manually." });
      });
  });

  // Login fail page; destroys the session
  router.get("/fail/", authRateLimit, async (req, res) => {
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
}
