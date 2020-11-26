/**
 * @fileoverview Main Hibiki file
 * @description Creates an instance of Hibiki
 * @author Espi <contact@espi.me>
 * @license MIT
 */

import { hibikiClient } from "./structures/Client";
import config from "../config.json";

new hibikiClient(config.token, config.options);
