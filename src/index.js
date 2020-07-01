/**
 * @fileoverview Main Hibiki file
 * @description Creates a bot instance
 * @author smolespi <espi@lesbian.codes>
 * @author resolved <resolvedxd@gmail.com>
 * @license AGPL-3.0-or-later
 */

const Hibiki = require("structures/Client");
const config = require("root/config");

new Hibiki(config.bot.token, config.options);
