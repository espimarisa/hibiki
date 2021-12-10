/**
 * @file Hibiki
 * @description Creates a new instance of Hibiki
 * @module hibiki
 */

import config from "../config.json";
import { HibikiClient } from "./classes/Client";

// Spawns a new instance of Hibiki
const bot = new HibikiClient(config as HibikiConfig);
bot.init();
