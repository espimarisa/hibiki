/**
 * @fileoverview Dashboard webserver
 * @description Main app file for the dashboard; handles all express modules
 * @module webserver/dashboard
 */

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const expressSession = require("express-session");
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const docker = require("../utils/docker");

const { dashboard: config, rethink: database } = require("../../config");
const session = require("@geo1088/express-session-rethinkdb")(expressSession);
const app = express();

const noCache = (_, res, next) => {
  res.header("Cache-Control", "no-cache");
  next();
};

app.use(helmet({ contentSecurityPolicy: false }));
app.enable("trust proxy", 1);

// Sets securityPolicy
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'", "fonts.googleapis.com", "fonts.gstatic.com", "cdn.jsdelivr.net"],
    imgSrc: ["'self'", "avatars1.githubusercontent.com", "cdn.discordapp.com"],
    scriptSrc: ["'self'", "'unsafe-inline'", "discord.com", "discordapp.com", "cdn.jsdelivr.net"],
    styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "discord.com", "discordapp.com"],
  },
}));

module.exports = async bot => {
  if (!config || !config.cookiesecret || !config.port || !config.redirect_uri || !config.secret) return;

  // Configures session store
  const sessionStore = new session({
    connectOptions: {
      host: docker === true ? "db" : database.host,
      db: database.db,
      password: database.password,
      port: database.port ? database.port : 28015,
      user: database.user ? database.user : "admin",
      silent: true,
    },
  });

  // Configures bodyParser
  app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: "5mb" }));
  app.use(bodyParser.json({ parameterLimit: 10000, limit: "5mb" }));

  // Sets headers
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Configures expressSession
  app.use(expressSession({
    secret: config.cookiesecret,
    store: sessionStore,
    name: bot.user.username,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      signed: true,
      path: "/",
    },
    httpOnly: true,
    resave: false,
    saveUninitialized: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  }));

  // Starts passport & cookieParser
  app.use(cookieParser(config.cookiesecret));

  app.use(csurf({
    cookie: true,
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  // Configures ejs options
  app.set("views", `${__dirname}/views`);
  app.set("partials", `${__dirname}/partials`);
  app.use("/public/", express.static(`${__dirname}/public`, { dotfiles: "allow" }));
  app.set("view engine", "ejs");

  // Routes
  app.use("/", require("./routes/index")(bot));
  app.use("/auth/", noCache, require("./routes/auth")(bot, passport));
  app.use("/manage/", noCache, require("./routes/manage")(bot, passport));
  app.use("/api/", noCache, require("./routes/api")(bot));

  // 404 handler
  app.use((req, res) => {
    if (req.accepts("html")) return res.render("404", { url: req.url });
    else if (req.accepts("json")) return res.send({ error: "404" });
    else res.type("txt").send("404");
  });

  bot.log.info(`Dashboard listening on port ${config.port}`);
  app.listen(config.port);
};
