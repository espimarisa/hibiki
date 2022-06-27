/**
 * @file Hibiki
 * @description Creates a new instance of Hibiki
 * @module hibiki
 */

import config from "../config.js";
import { HibikiClient } from "./classes/Client.js";

// Spawns a new instance of Hibiki
const bot = new HibikiClient(config);
bot.login(config.hibiki.token);
