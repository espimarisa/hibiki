/**
 * @fileoverview Main Hibiki file
 * @description Creates a bot instance
 */

const Hibiki = require("./structures/Client");
const config = require("../config");

new Hibiki(config.bot.token, config.options);
