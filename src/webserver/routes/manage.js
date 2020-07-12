const express = require("express");

const router = express.Router();

module.exports = (bot, passport) => {
  // Checks if user is authenticated
  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    console.log(req.user, req.isAuthenticated());
    return res.redirect("../../auth/");
  };

  // Renders list of servers
  router.get("/servers/", checkAuth, async (req, res) => {
    res.render("servers", { bot: bot, user: req.user });
  });

  return router;
};
