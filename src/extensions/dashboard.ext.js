/*
  Handles rendering, authentication, and redirection.
*/

const bodyparser = require("body-parser");
const cookieparser = require("cookie-parser");
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const strategy = require("passport-discord");
const format = require("utils/format");
const config = require("root/config").dashboard;

const scope = ["identify", "guilds"];
const app = express();

// Enables helmet & nginx
app.use(require("helmet")());
app.enable("trust proxy", 1);

// Checks authentication data
const checkAuth = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.redirect("/login/");
};

// Login fail handler
app.get("/login/fail/", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Gets authed user's data
const getAuthUser = user => ({
  username: user.username,
  discriminator: user.discriminator,
  guilds: user.guilds,
  id: user.id,
  avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
});

// Directories & viewengine
app.set("views", `${__dirname}/dash/views`);
app.set("partials", `${__dirname}/dash/partials`);
app.use("/static", express.static(`${__dirname}/dash/static`, { dotfiles: "allow" }));
app.set("view engine", "ejs");

// Loads auth system
module.exports = (bot) => {
  if (!config || !config.port || !config.cookiesecret) return;
  app.use(session({
    secret: `${config.cookiesecret}`,
    resave: false,
    saveUninitialized: false,
  }));

  // Sets headers
  app.use((_req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  // Body parsing & passport serialisation
  app.use(bodyparser.urlencoded({ extended: true, parameterLimit: 10000, limit: "5mb" }));
  app.use(bodyparser.json({ parameterLimit: 10000, limit: "5mb" }));
  passport.serializeUser((user, done) => { done(null, user); });
  passport.deserializeUser((obj, done) => { done(null, obj); });

  // Creates Discord passport
  passport.use(new strategy({ clientID: config.id, clientSecret: config.secret, callbackURL: config.redirect_uri, scope: scope },
    (_accessToken, _refreshToken, profile, done) => {
      process.nextTick(() => {
        return done(null, profile);
      });
    }));

  // Cookie parser & passport
  app.use(cookieparser());
  app.use(passport.initialize());
  app.use(passport.session());

  // Authentication
  app.get("/login/", passport.authenticate("discord", { scope: scope }));
  app.get("/login/callback/", passport.authenticate("discord", { failureRedirect: "/login/fail/" }), (_req, res) => {
    res.redirect("/servers/");
  });

  // Logout functionality
  app.get("/logout/", checkAuth, (req, res) => {
    req.logout();
    res.redirect("/");
  });

  // Renders list of servers
  app.get("/servers/", checkAuth, (req, res) => {
    res.render("servers", { bot: bot, user: req.user });
  });

  // Handles redirects
  app.get("/invite/", (_req, res) => {
    res.redirect(`https://discordapp.com/oauth2/authorize?&client_id=${bot.user.id}&scope=bot&permissions=506850534`);
  });

  app.get("/repo/", (_req, res) => {
    res.redirect("https://github.com/smolespi/Hibiki");
  });

  app.get("/support/", (_req, res) => {
    res.redirect(`https://discord.gg/${bot.config.support}`);
  });

  app.get("/twitter/", (_req, res) => {
    res.redirect("https://twitter.com/HibikiApp");
  });

  app.get("/vote/", (_req, res) => {
    res.redirect("https://top.gg/bot/493904957523623936/vote");
  });

  // Server manager
  app.get("/manage/:id", checkAuth, async (req, res) => {
    // Sets vaild items
    const items = require("utils/items");
    // If user isn't authenticated
    if (!req.isAuthenticated()) { res.status(401).render("401"); }
    // User & guild perms
    const user = getAuthUser(req.user);
    const managableguilds = user.guilds.filter(g => (g.permissions & 32) === 32 && bot.guilds.get(g.id));
    const guild = managableguilds.find(g => g.id === req.params.id);
    // Renders the dashboard
    if (!guild) return res.status(403).render("403");
    const cfg = await bot.db.table("guildcfg").get(guild.id);
    res.render("manage.ejs", { guild: guild, bot: bot, cfg: cfg, items: items, user: user });
  });

  // Renders landing page
  app.get("/", (req, res) => {
    res.render("index", {
      checkAuth: checkAuth,
      bot: bot,
      avatar: bot.user.avatar ? `https://cdn.discordapp.com/avatars/${bot.user.id}/${bot.user.avatar}.png` :
        "https://cdn.discordapp.com/embed/avatars/0.png",
      authUser: req.isAuthenticated() ? getAuthUser(req.user) : null,
      format: format,
    });
  });

  // API
  app.use(require("./dash/api/getItems")(bot));
  app.use(require("./dash/api/getConfig")(bot));
  app.use(require("./dash/api/updateConfig")(bot));
  app.use(require("./dash/api/getBio")(bot));
  app.use(require("./dash/api/updateBio")(bot));

  // 404 handler
  app.use((req, res) => {
    if (req.accepts("html")) return res.render("404", { url: req.url });
    if (req.accepts("json")) return res.send({ error: "404" });
    res.type("txt").send("404");
  });

  // Listens on port
  app.listen(config.port);
};
