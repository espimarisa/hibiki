/**
 * @file Webserver
 * @description Webserver for dashboard and voting
 * @module webserver/index
 */

import type { NextFunction, Request, Response } from "express";
import type { SessionOptions } from "express-session";
import type { HibikiClient } from "../classes/Client";
import { Liquid } from "liquidjs";
import { RethinkDBStore } from "session-rethinkdb-ts";
import { readFileSync, readdirSync } from "fs";
import { minify } from "terser";
import { apiRoutes } from "./routes/api";
import { authRoutes } from "./routes/auth";
import { indexRoutes } from "./routes/index";
import { manageRoutes } from "./routes/manage";
import { votingRoutes } from "./routes/voting";
import { loadIcons } from "../utils/webserver";
import cookieParser from "cookie-parser";
import cors from "cors";
import crypto from "crypto";
import csurf from "csurf";
import express from "express";
import expressSession from "express-session";
import helmet from "helmet";
import passport from "passport";
import path from "path";

const isProduction = process.env.NODE_ENV === "production";
const LAYOUTS_DIRECTORY = path.join(__dirname, "layouts");
const PARTIALS_DIRECTORY = path.join(__dirname, "partials");
const PUBLIC_DIRECTORY = path.join(__dirname, "public");
const VIEWS_DIRECTORY = path.join(__dirname, "views");
const cookieSecret = crypto.randomBytes(48).toString("hex");

export function startWebserver(bot: HibikiClient) {
  const app = express();
  app.enable("trust proxy");

  // Disables cache-control on specified routes
  const noCache = (_req: Request, res: Response, next: NextFunction) => {
    res.header("Cache-Control", "no-cache");
    next();
  };

  // Enables CSRF protection on specified routes
  const csurfProtection = csurf({ cookie: true });

  // RethinkDB session store
  const sessionStore = new RethinkDBStore({
    connectOptions: {
      db: bot.config.database.db,
      password: bot.config.database.password,
      port: bot.config.database.port,
      host: bot.config.database.host,
      user: bot.config.database.user,
      silent: true,
    },
  });

  // Express session options
  const sessionOptions: SessionOptions = {
    secret: cookieSecret,
    store: sessionStore,
    name: "Session",
    resave: false,
    saveUninitialized: false,
    unset: "destroy",
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      signed: true,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      // If you are getting infinite redirects, set this to "false" if you don't have a HTTPS-only environment setup.
      secure: bot.config.dashboard.cookieSecure,
    },
  };

  // Sets nonce locale
  app.use((_req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString("hex");
    next();
  });

  // Enables helmet and contentSecurityPolicy
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use((req, res, next) => {
    helmet.contentSecurityPolicy({
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "img-src": ["'self'", "cdn.discordapp.com"],
        "script-src": ["'self'", `'nonce-${res.locals.nonce}'`],
      },
    })(req, res, next);
  });

  // Middleware
  app.use(cors({ credentials: true }));
  app.use(cookieParser(cookieSecret));
  app.use(expressSession(sessionOptions));
  app.use(express.urlencoded({ extended: true, limit: "1mb" }));
  app.use(express.json({ limit: "1mb" }));
  app.use(passport.initialize());
  app.use(passport.session());

  // Liquid engine options
  const engine = new Liquid({
    root: [VIEWS_DIRECTORY, PARTIALS_DIRECTORY, LAYOUTS_DIRECTORY],
    cache: isProduction,
    lenientIf: true,
    jsTruthy: true,
    extname: ".liquid",
  });

  // Custom icon tag
  loadIcons(engine);

  // View engine options
  app.engine("liquid", engine.express());
  app.set("views", [VIEWS_DIRECTORY, PARTIALS_DIRECTORY, LAYOUTS_DIRECTORY]);
  app.set("view engine", "liquid");

  // Minifies JS if running in production
  if (process.env.NODE_ENV === "production") {
    const files = readdirSync(`${PUBLIC_DIRECTORY}/js`, { withFileTypes: true, encoding: "utf-8" });
    files.forEach(async (file) => {
      if (file.isDirectory()) return;
      if (!file.name.endsWith(".js")) return;
      const fileSource = readFileSync(`${PUBLIC_DIRECTORY}/js/${file.name}`, { encoding: "utf-8" });
      const minifiedFile = await minify(fileSource, {
        sourceMap: false,
        mangle: true,
        format: {
          indent_level: 2,
          comments: false,
        },
        compress: {
          defaults: true,
        },
      });

      // Falls back to using non-minified files
      if (!minifiedFile.code) {
        bot.log.error(`Error while minifying ${file.name}, the non-minified one will be served instead.`);
        app.use(`${PUBLIC_DIRECTORY}/js/${file.name}`, (_req, res) => {
          return res.send(fileSource);
        });
      }

      // Uses the minified files
      app.use(`${PUBLIC_DIRECTORY}/js/${file.name}`, (_req, res) => {
        res.set("Content-Type", "application/javascript").send(minifiedFile.code);
      });
    });
  }

  // Uses public folder
  app.use("/public/", express.static(PUBLIC_DIRECTORY));

  // Routes
  app.use("/vote/", votingRoutes(bot));
  app.use("/api/", csurfProtection, apiRoutes(bot));
  app.use("/auth/", csurfProtection, noCache, authRoutes(bot.user));
  app.use("/manage/", csurfProtection, noCache, manageRoutes(bot));
  app.use("/", csurfProtection, indexRoutes(bot));

  // 404 handler
  app.use((req, res) => {
    if (req.accepts("html")) return res.status(404).render("404", { url: req.url, errorCode: 404 });
    else if (req.accepts("json")) return res.status(404).send({ error: "404" });
    else res.status(404).type("txt").send("404");
  });

  app.listen(bot.config.dashboard.port, "0.0.0.0", () => {
    bot.log.info(`Webserver running on port ${bot.config.dashboard.port}`);
  });
}
