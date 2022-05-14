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
const HIBIKI_DATABASE_FILE = path.join(__dirname, IS_PRODUCTION ? "../../../hibiki.db.json" : "../../hibiki.db.json");

// A type that emulates a Hibiki JSON database structure
type HibikiJSONDatabaseStructure = {
  [DATABASE_TABLES.BLACKLIST]: HibikiBlacklistItem[];
  [DATABASE_TABLES.GUILD_CONFIGS]: HibikiGuildConfig[];
  [DATABASE_TABLES.USER_CONFIGS]: HibikiUserConfig[];
  [DATABASE_TABLES.USER_WARNINGS]: any[];
};

export class JSONProvider extends HibikiProvider {
  db = {} as HibikiJSONDatabaseStructure;

  public async getGuildConfig(guild: DiscordSnowflake): Promise<HibikiGuildConfig> {
    const guildConfig = this.db.GUILD_CONFIGS.find((g: HibikiGuildConfig) => g.id === guild);
    if (!guildConfig) {
      await this.insertBlankGuildConfig(guild);
      return this.getGuildConfig(guild);
    }

    return guildConfig;
  }

  public async updateGuildConfig(guild: DiscordSnowflake, config: HibikiGuildConfig): Promise<void> {
    const guildConfig = this.db.GUILD_CONFIGS.find((g: HibikiGuildConfig) => g.id === guild);
    if (!guildConfig) {
      await this.insertBlankGuildConfig(guild);
      return this.updateGuildConfig(guild, config);
    }

    // assign each property of the config to the guild config
    Object.keys(config).forEach((key) => {
      guildConfig[key] = config[key];
    });

    this._updateJSON();
  }

  public async deleteGuildConfig(guild: DiscordSnowflake) {
    const guildConfigIndex = this.db.GUILD_CONFIGS.findIndex((g: HibikiGuildConfig) => g.id === guild);
    if (guildConfigIndex === -1) return;
    this.db.GUILD_CONFIGS.splice(guildConfigIndex, 1);
    this._updateJSON();
  }

  public async insertBlankGuildConfig(guild: DiscordSnowflake) {
    this.db.GUILD_CONFIGS.push({ id: guild });
    this._updateJSON();
  }

  public async getUserConfig(user: DiscordSnowflake): Promise<HibikiUserConfig> {
    const userConfig = this.db.USER_CONFIGS.find((u: HibikiUserConfig) => u.id === user);
    if (!userConfig) {
      await this.insertBlankUserConfig(user);
      return this.getUserConfig(user);
    }

    return userConfig;
  }

  public async updateUserConfig(user: DiscordSnowflake, config: HibikiUserConfig): Promise<void> {
    const userConfig = this.db.USER_CONFIGS.find((u: HibikiUserConfig) => u.id === user);
    if (!userConfig) {
      await this.insertBlankUserConfig(user);
      return this.updateUserConfig(user, config);
    }

    // assign each property of the config to the user config
    Object.keys(config).forEach((key) => {
      userConfig[key] = config[key];
    });

    this._updateJSON();
  }

  public async replaceUserConfig(user: DiscordSnowflake, config: HibikiUserConfig): Promise<void> {
    const userConfig = this.db.USER_CONFIGS.find((u: HibikiUserConfig) => u.id === user);
    if (!userConfig) {
      await this.insertBlankUserConfig(user);
      return this.replaceUserConfig(user, config);
    }

    // Delete all keys in the user config
    Object.keys(userConfig).forEach((key) => {
      delete userConfig[key];
    });

    // assign each property of the config to the user config
    Object.keys(config).forEach((key) => {
      userConfig[key] = config[key];
    });

    this._updateJSON();
  }

  public async deleteUserConfig(user: DiscordSnowflake) {
    const userConfig = this.db.USER_CONFIGS.findIndex((u: HibikiUserConfig) => u.id === user);
    if (userConfig === -1) return;
    this.db.USER_CONFIGS.splice(userConfig, 1);
    this._updateJSON();
  }

  public async insertBlankUserConfig(user: DiscordSnowflake) {
    this.db.USER_CONFIGS.push({ id: user });
    this._updateJSON();
  }

  public async insertBlacklistItem(id: string, reason: string, type: HibikiGuildOrUser) {
    this.db.BLACKLIST.push({ id, reason, type });
    this._updateJSON();
  }

  public async deleteBlacklistItem(id: string) {
    const item = this.db.BLACKLIST.findIndex((item: HibikiBlacklistItem) => item.id === id);
    if (item === -1) return;
    this.db.BLACKLIST.splice(item, 1);
    this._updateJSON();
  }

  public async getBlacklist(type?: HibikiGuildOrUser) {
    if (type) return this.db.BLACKLIST.filter((item) => item.type === type);
    return this.db.BLACKLIST;
  }

  public async getBlacklistItem(id: string, type: HibikiGuildOrUser): Promise<HibikiBlacklistItem | undefined> {
    const item = this.db.BLACKLIST.find((i) => i.id === id && i.type === type);
    if (!item) return;
    return item;
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
