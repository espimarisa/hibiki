/**
 * @fileoverview Dashboard webserver
 * @description Main app file for the dashboard; handles all express modules
 * @module webserver
 */

// TODO: figure out why auth is broken, even on previously working (bad) code
// even moving stuff here instead of in routes makes no difference

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const eSession = require("express-session");
const session = require("express-session-rethinkdb")(eSession);
const express = require("express");
const passport = require("passport");
const { dashboard: config, rethink: dbConfig } = require("../../config");
const app = express();

app.enable("trust proxy", 1);

// removing helmet didn't change shit!
app.use(require("helmet")());

// Configures session store
const sessionStore = new session({
    connectOptions: {
      host: dbConfig.host,
      port: dbConfig.port,
      db: dbConfig.db,
      user: dbConfig.user || "admin",
      password: dbConfig.password
    }
});
module.exports = async (bot) => {
  if (!config || !config.cookiesecret || !config.port || !config.redirect_uri || !config.secret) return;

  // Configures bodyParser
  app.use(bodyParser.urlencoded({ extended: true, parameterLimit: 10000, limit: "5mb" }));
  app.use(bodyParser.json({ parameterLimit: 10000, limit: "5mb" }));

  // Sets headers
  // I was told this would help, we did this in v2 aswell. Made fuckall difference !!
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Configures cookieParser & starts passport
  app.use(cookieParser(config.cookiesecret));
  app.use(eSession({
      secret: config.cookiesecret,
      store: sessionStore,
      cookie: {
          maxAge: 8064e5 * 2
      },
      resave: false,
      saveUninitialized: false,
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
  app.use("/auth/", require("./routes/auth")(bot, passport));
  app.use("/manage/", require("./routes/manage")(bot, passport));
  // app.use("/api/", require("./routes/api")(bot));

  // 404 handler
  app.use((req, res) => {
    if (req.accepts("html")) return res.render("404", { url: req.url });
    else if (req.accepts("json")) return res.send({ error: "404" });
    else res.type("txt").send("404");
  });

  bot.log.info(`Dashboard listening on port ${config.port}`);
  app.listen(config.port);
};
