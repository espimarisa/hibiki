/**
 * @file Hibiki
 * @description Creates a new instance of Hibiki
 * @module hibiki
 */

import config from "../config";
import { HibikiClient } from "./classes/Client";
import { validateConfig } from "./utils/validator";

// Checks to see if the config is valid
validateConfig(config);

// Spawns a new instance of Hibiki
const bot = new HibikiClient(config);
bot.init();
