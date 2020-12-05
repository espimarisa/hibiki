/**
 * @file Index
 * @description Creates an instance of Hibiki
 * @author Espi <contact@espi.me>
 * @license AGPL-3.0-or-later
 */

import { hibikiClient } from "./structures/Client";
import config from "../config.json";

new hibikiClient(config.token, config.options);
