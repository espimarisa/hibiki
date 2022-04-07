/**
 * @file Validator
 * @description Various functions to validate items such as configs
 * @module utils/validator
 */

import { jwtRegex, httpRegex, colourRegex } from "./constants";
import { logger } from "./logger";
import fs from "node:fs";
import path from "node:path";

const LOCALES_DIRECTORY = path.join(__dirname, "../locales");

/**
 * Validates a Hibii config
 * @param config The Hibiki config to validate
 */

export function validateConfig(config: HibikiConfig) {
  /**
   * Validates the hibiki config object
   */

  // Validates the bot token
  const jwtResult = jwtRegex.test(config.hibiki.token);
  if (!jwtResult) {
    throw new ConfigError("An invalid bot token was provided.");
  }

  // Ensures that the configured locale is present in the locales directory
  const locales = fs.readdirSync(LOCALES_DIRECTORY).map((file) => file.split(".")[0]);
  if (!locales.includes(config.hibiki.locale)) {
    throw new ConfigError(`Configured locale ${config.hibiki.locale} is not a supported locale.`);
  }

  /**
   * Validates the webserver object
   */

  // Checks to see if a valid port is set (1-65535)
  if (config.webserver.port < 1 || config.webserver.port > 65_535) {
    throw new ConfigError("Invalid port");
  }

  // Logs if the port is running on a traditionally "protected" port
  if (config.webserver.port === 80 || config.webserver.port === 443) {
    logger.warn(`Webserver running on a traditionally protected port ${config.webserver.port}. You may run into permissions errors.`);
  }

  // Validates the baseURL
  const baseURLResult = httpRegex.test(config.webserver.baseURL);
  if (!baseURLResult) {
    throw new ConfigError("An invalid webserver baseURL was configured.");
  }

  // Validates the callbackURI
  const callbackResult = httpRegex.test(config.webserver.callbackURI);
  if (!callbackResult) {
    throw new ConfigError("An invalid callbackURI was configured.");
  }

  // Validate session secret
  if (config.webserver.sessionSecret.length < 32) {
    throw new ConfigError("Session secret must be at least 32 characters long.");
  }
  /**
   * Validates the colours object
   * @TODO: Fix this from erroring with 0x stuff
   */

  // Checks to see if all colours are valid
  for (const colour in config.colours) {
    if (!colourRegex.test(<string>config.colours[colour])) {
      throw new ConfigError(`An invalid colour was configured: ${colour}`);
    }
  }
}

class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigError";
  }
}
