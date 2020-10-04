/**
 * @fileoverview Dashboard webserver
 * @description Main app file for the dashboard; handles all express modules
 * @module webserver/dashboard
 */

const { minify } = require("terser");
const { readdirSync, readFileSync } = require("fs");

const bodyParser = require("body-parser");
const compression = require("compression");
const cookieParser = require("cookie-parser");
const csurf = require("csurf");
const expressSession = require("express-session");
const express = require("express");
const helmet = require("helmet");
const passport = require("passport");
const robots = require("express-robots-txt");
const docker = require("../utils/docker");

const { dashboard: config, rethink: database } = require("../../config");
const session = require("@geo1088/express-session-rethinkdb")(expressSession);
const app = express();

const noCache = (_, res, next) => {
  res.header("Cache-Control", "no-cache");
  next();
};

// Decides if we should compress data or not
const shouldCompress = (req, res) => !req.headers["X-No-Compression"] && compression.filter(req, res);

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
      host: docker ? "db" : database.host,
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

  // Configures cookieParser and csurf
  app.use(cookieParser(config.cookiesecret));
  app.use(csurf({ cookie: true }));

  // Configures passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Configures ejs options
  app.set("views", `${__dirname}/views`);
  app.set("partials", `${__dirname}/partials`);
  app.set("view engine", "ejs");

  // Minfiies files if in production; adds robots.txt, and compresses data
  if (process.env.NODE_ENV === "production") {
    const files = readdirSync(`${__dirname}/public/js`, { withFileTypes: true });
    for (const file of files) {
      if (file.isDirectory()) return;
      if (!file.name.endsWith(".js")) return;
      const fileSource = readFileSync(`${__dirname}/public/js/${file.name}`, { encoding: "utf-8" });
      const minifiedFile = await minify(fileSource);

      // Uses non-minified files if errored
      if (minifiedFile.error || !minifiedFile.code) {
        bot.log.error(`Error while minifying ${file.name}, the non-minified one will be served instead.`);
        app.use(`/public/js/${file.name}`, (req, res) => { res.send(fileSource); });
        return;
      }

      // Uses minified files, adds robots.txt, and enables the compression filter
      app.use(`/public/js/${file.name}`, (req, res) => { res.set("Content-Type", "application/javascript").send(minifiedFile.code); });
      app.use(robots({ UserAgent: "*", Disallow: "/public/", CrawlDelay: "5" }));
      app.use(compression({ filter: shouldCompress }));
    }
  }

  // Sets public/static directory
  app.use("/public/", express.static(`${__dirname}/public`, { dotfiles: "allow" }));

  // Routes
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

  bot.log.info(`Dashboard listening on port ${config.port}`);
  app.listen(docker ? 7012 : config.port);
};
