import config from "../config.js";
import { HibikiClient } from "./classes/HibikiClient.js";

const bot = new HibikiClient(config);
bot.init();
