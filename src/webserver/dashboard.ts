/**
 * @file Dashboard
 * @description Main webserver for the dashboard
 */

import type { HibikiClient } from "../classes/Client";
import type { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import csurf from "csurf";
import express from "express";
import expressSession from "express-session";
import passport from "passport";
import config from "../../config.json";

const session = require("@geo1088/express-session-rethinkdb")(expressSession);
const app = express();
app.enable("trust proxy");

// Disables cache-control on specified routes
const noCache = (req: Request, res: Response, next: NextFunction) => {
  res.header("Cache-Control", "no-cache");
  next();
};

/** Starts the dashboard */
export async function startDashboard(bot: HibikiClient) {
  if (!config.dashboard.port) return;

  // Configures session store
  const sessionStore = new session({
    connectOptions: {
      db: config.database.db || undefined,
      password: config.database.password || undefined,
      port: Number(config.database.port) || 28015,
      host: config.database.host || undefined,
      user: config.database.user || undefined,
      silent: true,
    },
  });

  // Enables bodyParser
  app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: "5mb" }));
  app.use(bodyParser.json({ limit: "5mb" }));

  // Sets headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Enables expressSession
  app.use(
    expressSession({
      secret: config.dashboard.cookieSecret,
      store: sessionStore,
      name: bot.user.username,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        signed: true,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      },
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Enables cookieParser and csurf
  app.use(cookieParser(config.dashboard.cookieSecret));
  app.use(csurf({ cookie: true }));

  // Enables passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Directories and EJS options
  app.set("views", `${__dirname}/views`);
  app.set("partials", `${__dirname}/partials`);
  app.set("view engine", "ejs");
  app.use("/public/", express.static(`${__dirname}/public`, { dotfiles: "allow" }));

  // Routes and APIs
  app.use("/", require("./routes/index")(bot));
  app.use("/api/", noCache, require("./routes/api")(bot));
  app.use("/auth/", noCache, require("./routes/auth")(bot, passport));
  app.use("/manage/", noCache, require("./routes/manage")(bot, passport));

  // 404 handler
  app.use((req, res) => {
    if (req.accepts("html")) return res.render("404", { url: req.url });
    else if (req.accepts("json")) return res.send({ error: "404" });
    else res.type("txt").send("404");
  });

  // Listens on the configured port
  // TODO: Docker support. (ask @TTtie)
  app.listen(config.dashboard.port, async () => {
    bot.log.info(`Dashboard listening on port ${config.dashboard.port}`);
  });
}
