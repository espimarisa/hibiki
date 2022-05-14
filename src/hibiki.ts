/**
 * @file Hibiki
 * @description Creates a new instance of Hibiki
 * @module hibiki
 */

import config from "../config.js";
import { HibikiClient } from "./classes/Client.js";
import { validateConfig } from "./utils/validator.js";

// Checks to see if the config is valid
validateConfig(config);

// Spawns a new instance of Hibiki
const bot = new HibikiClient(config);
bot.init();
