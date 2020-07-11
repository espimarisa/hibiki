const express = require("express");

const router = express.Router();

module.exports = (bot) => {
  // Checks if user is authenticated
  const checkAuth = (req, res, next) => {
    if (req.isAuthenticated()) return next();
    // return true, you fucker!
    // console.log(req.isAuthenticated());
    return res.redirect("../../auth/");
  };

  // Renders list of servers
  router.get("/servers/", checkAuth, async (req, res) => {
    res.render("servers", { bot: bot, user: req.user });
  });

  return router;
};
