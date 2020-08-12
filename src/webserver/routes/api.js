/**
 * @fileoverview Dashboard API
 * @description Handles any API routes and requests
 * @param {Object} bot Main bot object
 */

const express = require("express");
const router = express.Router();

module.exports = (bot) => {
  console.log(bot.id);
  return router;
};
