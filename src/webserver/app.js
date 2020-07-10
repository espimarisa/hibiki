const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const express = require("express");
const passport = require("passport");
const config = require("../../config").dashboard;
const app = express();

app.enable("trust proxy", 1);
app.use(require("helmet")());

module.exports = (bot) => {
  if (!config || !config.cookiesecret || !config.port || !config.redirect_uri || !config.secret) return;

  // Configures bodyParser
  app.use(bodyParser.urlencoded({
    extended: true,
    parameterLimit: 10000,
    limit: "5mb",
  }));

  app.use(bodyParser.json({
    parameterLimit: 10000,
    limit: "5mb",
  }));

  // Configures cookieSession
  app.use(cookieSession({
    name: bot.user.username,
    keys: [config.cookiesecret, config.secret],
    maxAge: 1000 * 60 * 60 * 24 * 7,
    signed: true,
  }));

  // Configures cookieParser & starts passport
  app.use(cookieParser(config.cookiesecret));
  app.use(passport.initialize());
  app.use(passport.session());

  // Configures ejs options
  app.set("views", `${__dirname}/views`);
  app.set("partials", `${__dirname}/partials`);
  app.use("/public/", express.static(`${__dirname}/public`, { dotfiles: "allow" }));
  app.set("view engine", "ejs");

  // Routes
  app.use("/", require("./routes/index")(bot));
  app.use("/auth/", require("./routes/auth")(bot));
  app.use("/manage/", require("./routes/manage")(bot));
  // app.use("/api/", require("./routes/api")(bot));

  // 404 handler
  app.use((req, res) => {
    if (req.accepts("html")) return res.render("404", { url: req.url });
    if (req.accepts("json")) return res.send({ error: "404" });
    res.type("txt").send("404");
  });

  bot.log.info(`Dashboard listening on port ${config.port}`);
  app.listen(config.port);
};
