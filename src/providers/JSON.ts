/**
 * @file JSON Provider
 * @description The Hibiki JSON database provider
 * @module JSONProvider
 */

import { HibikiProvider, DATABASE_TABLES } from "../classes/Provider.js";
import { logger } from "../utils/logger.js";
import fs from "node:fs";
import path from "node:path";

const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Decides which file to store a "database" in
const HIBIKI_DATABASE_FILE = path.join(__dirname, IS_PRODUCTION ? "../../../hibiki.db.json" : "../../hibiki.db.json");

// A type that emulates a Hibiki JSON database structure
export type HibikiJSONDatabaseStructure = {
  [DATABASE_TABLES.GUILD_CONFIGS]: HibikiGuildConfig[];
  [DATABASE_TABLES.USER_CONFIGS]: HibikiUserConfig[];
  [DATABASE_TABLES.USER_WARNINGS]: any[];
};

export class JSONProvider extends HibikiProvider {
  db = {} as HibikiJSONDatabaseStructure;

  // Gets a guild config
  public async getGuildConfig(guild: DiscordSnowflake): Promise<HibikiGuildConfig | undefined> {
    const guildConfig = this.db.GUILD_CONFIGS.find((g) => g.id === guild);
    if (!guildConfig) return;
    return guildConfig;
  }

  // Updates a guild config
  public async updateGuildConfig(guild: DiscordSnowflake, config: HibikiGuildConfig): Promise<void> {
    const guildConfig = this.db.GUILD_CONFIGS.find((g) => g.id === guild);

    if (!guildConfig) {
      await this.insertBlankGuildConfig(guild);
      return this.updateGuildConfig(guild, config);
    }

    // Assign each property of the config to the guild config
    Object.keys(config).forEach((key) => {
      guildConfig[key] = config[key];
    });

    // Saves changes
    this._updateJSON();
  }

  // Deletes a guild config
  public async deleteGuildConfig(guild: DiscordSnowflake) {
    // Gets the index of the guild config
    const guildConfigIndex = this.db.GUILD_CONFIGS.findIndex((g) => g.id === guild);
    if (guildConfigIndex === -1) return;

    // Deletes the guild config
    this.db.GUILD_CONFIGS.splice(guildConfigIndex, 1);

    // Saves changes
    this._updateJSON();
  }

  // Inserts a blank guild config
  public async insertBlankGuildConfig(guild: DiscordSnowflake) {
    this.db.GUILD_CONFIGS.push({ id: guild });
    this._updateJSON();
  }

  // Gets a user's config
  public async getUserConfig(user: DiscordSnowflake) {
    const userConfig = this.db.USER_CONFIGS.find((u: HibikiUserConfig) => u.id === user);
    if (!userConfig) return;
    return userConfig;
  }

  // Updates a user's config
  public async updateUserConfig(user: DiscordSnowflake, config: HibikiUserConfig): Promise<void> {
    const userConfig = this.db.USER_CONFIGS.find((u: HibikiUserConfig) => u.id === user);

    // Inserts a blank config if need be
    if (!userConfig) {
      await this.insertBlankUserConfig(user);
      return this.updateUserConfig(user, config);
    }

    // Assign each property of the config to the user config
    Object.keys(config).forEach((key) => {
      userConfig[key] = config[key];
    });

    // Saves changesS
    this._updateJSON();
  }

  // Replaces a user's config
  public async replaceUserConfig(user: DiscordSnowflake, config: HibikiUserConfig): Promise<void> {
    const userConfig = this.db.USER_CONFIGS.find((u: HibikiUserConfig) => u.id === user);

    // Inserts a blank config if need be
    if (!userConfig) {
      await this.insertBlankUserConfig(user);
      return this.replaceUserConfig(user, config);
    }

    // Delete all keys in the user config
    Object.keys(userConfig).forEach((key) => {
      delete userConfig[key];
    });

    // Assign each property of the config to the user config
    Object.keys(config).forEach((key) => {
      userConfig[key] = config[key];
    });

    // Saves changes
    this._updateJSON();
  }

  // Deletes a user's config
  public async deleteUserConfig(user: DiscordSnowflake) {
    // Find's the config's index
    const userConfig = this.db.USER_CONFIGS.findIndex((u: HibikiUserConfig) => u.id === user);
    if (userConfig === -1) return;

    // Deletes the config
    this.db.USER_CONFIGS.splice(userConfig, 1);

    // Saves changes
    this._updateJSON();
  }

  // Inserts a blank user config
  public async insertBlankUserConfig(user: DiscordSnowflake) {
    this.db.USER_CONFIGS.push({ id: user });
    this._updateJSON();
  }

  /**
   * Initializes the database
   */

  public async init() {
    // Creates a new file if it doesn't exist
    if (!fs.existsSync(HIBIKI_DATABASE_FILE)) {
      try {
        // Writes an empty file
        fs.writeFileSync(HIBIKI_DATABASE_FILE, "{}");
      } catch (error) {
        logger.error(`Failed to write the initial output file: ${error}`);
        throw new Error(error as string);
      }
    }

    // Ensures the config isn't empty
    const HIBIKI_DATABASE_FILE_CONTENTS = fs.readFileSync(HIBIKI_DATABASE_FILE, { encoding: "utf8" })?.toString();
    if (!HIBIKI_DATABASE_FILE_CONTENTS?.length) fs.writeFileSync(HIBIKI_DATABASE_FILE, "{}");

    this.db = JSON.parse(HIBIKI_DATABASE_FILE_CONTENTS);
    for (const name of Object.values(DATABASE_TABLES)) {
      if (!this.db[name]) {
        this.db[name] = [];
        logger.info(`Created the ${name} table in the database`);
        this._updateJSON();
      }
    }
  }

  /**
   * Updates a JSON database
   */

  private async _updateJSON() {
    fs.writeFileSync(HIBIKI_DATABASE_FILE, JSON.stringify(this.db), { encoding: "utf8" });
  }
}
