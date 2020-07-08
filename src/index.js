/**
 * @fileoverview Main Hibiki file
 * @description Creates a bot instance
 * @author smolespi <espi@lesbian.codes>
 * @author resolved <resolvedxd@gmail.com>
 * @author cth103 <cthdev@email.com>
 * @license AGPL-3.0-or-later
 */

const Hibiki = require("./structures/Client");
const config = require("../config");

new Hibiki(config.bot.token, config.options);
