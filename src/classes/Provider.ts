/**
 * @file Provider
 * @description Base database provider for providers to extend from
 * @module HibikiProvider
 */

import type { HibikiClient } from "./Client";
import type { PathLike } from "node:fs";
import { moduleFiletypeRegex } from "../utils/constants";
import { logger } from "../utils/logger";
import fs from "node:fs";

// Database table layout
export enum DATABASE_TABLES {
  GUILD_CONFIGS = "GUILD_CONFIGS",
  USER_CONFIGS = "USER_CONFIGS",
  USER_WARNINGS = "USER_WARNINGS",
  BLACKLIST = "BLACKLIST",
}

// Type for a callable Hibiki provider
interface CallableHibikiProvider {
  new (bot: HibikiClient): HibikiProvider;
}

/**
 * Gets a database provider and loads it
 * @param provider The provider to load
 * @param directory The directory to look for providers in
 * @returns A loaded database provider
 */

export function getDatabaseProvider(provider: HibikiDatabaseProvider, directory: PathLike) {
  let providerToLoad;

  // Looks through providers and finds the matching one
  const providers = fs.readdirSync(directory, { withFileTypes: true, encoding: "utf8" });
  const providerFile = providers.find((file) => file.name.replace(moduleFiletypeRegex, "")?.toLowerCase() === provider.toLowerCase())?.name;

  // Tries to load the provider
  try {
    providerToLoad = require(`${directory}/${providerFile}`);
  } catch (error) {
    logger.error(`Failed to load the database provider ${providerFile}, falling back to JSON: ${error}`);
    providerToLoad = require(`${directory}/JSON`);
  }

  // Returns the loaded provider
  return providerToLoad[Object.keys(providerToLoad)[0]] as CallableHibikiProvider;
}

/**
 * Base class for all providers to extend from
 * @abstract
 */

export abstract class HibikiProvider {
  constructor(protected bot: HibikiClient) {}

  /**
   * Initializes a database
   */

  public abstract init(): Promise<any>;

  /**
   * Gets a guild's config
   * @param guild The guild ID to lookup
   * @returns A guild's config
   */

  public abstract getGuildConfig(guild: DiscordSnowflake): Promise<HibikiGuildConfig>;

  /**
   * Deletes a guild's config
   * @param guild The guild ID to delete a config for
   */

  public abstract deleteGuildConfig(guild: DiscordSnowflake): Promise<any>;

  /**
   * Inserts a blank guild config
   * @param guild The guild ID to insert a blank config for
   */

  public abstract insertBlankGuildConfig(guild: DiscordSnowflake): Promise<any>;

  /**
   * Updates a guild's config
   * @param guild The guild ID to update a config in
   * @param config The config to insert
   */

  public abstract updateGuildConfig(guild: DiscordSnowflake, config: HibikiGuildConfig): Promise<any>;

  /**
   * Gets a guild's config
   * @param guild The guild ID to lookup
   * @returns A guild's config
   */

  public abstract getUserConfig(guild: DiscordSnowflake): Promise<HibikiUserConfig>;

  /**
   * Deletes a user's config
   * @param user The user ID to delete a config for
   */

  public abstract deleteUserConfig(user: DiscordSnowflake): Promise<any>;

  /**
   * Inserts a blank user config
   * @param user The user ID to insert a blank config for
   */

  public abstract insertBlankUserConfig(user: DiscordSnowflake): Promise<any>;

  /**
   * Updates a user's config
   * @param guild The user ID to update a config in
   * @param config The config to insert
   */

  public abstract updateUserConfig(user: DiscordSnowflake, config: HibikiUserConfig): Promise<any>;

  /**
   * Adds an ID to the blacklist
   * @param id The ID to add to the blacklist
   * @param reason The reason for adding the ID to the blacklist
   * @param type The type of blacklist to add to (GUILD or USER)
   */

  public abstract insertBlacklistItem(id: DiscordSnowflake, reason: string, type: HibikiGuildOrUser): Promise<any>;

  /**
   * Deletes an ID from the blacklist
   * @param id The ID to delete from the blacklist
   */

  public abstract deleteBlacklistItem(id: DiscordSnowflake): Promise<any>;

  /**
   * Gets the blacklist
   */

  public abstract getBlacklist(type?: HibikiGuildOrUser): Promise<HibikiBlacklistItem[]>;

  /**
   * Gets a blacklist item
   * @param id The ID to lookup
   **/

  public abstract getBlacklistItem(id: DiscordSnowflake, type: HibikiGuildOrUser): Promise<HibikiBlacklistItem | undefined>;
}
