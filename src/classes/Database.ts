/**
 * @file Database
 * @description Creates a new Database connection
 * @module Database
 */

import { PrismaClient } from "@prisma/client";

export class DatabaseManager {
  protected readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  /**
   * Gets a guildConfig
   * @param guild The guild ID to search for a config for
   */

  public async getGuildConfig(guild: DiscordSnowflake) {
    if (!guild?.length) return;

    // Looks for the guildconfig
    const config = await this.client.guildConfig.findUnique({
      where: {
        guild_id: guild,
      },
    });

    if (!config || !config?.guild_id?.length) return;
    return JSON.stringify(config) as HibikiGuildConfig;
  }

  /**
   * Updates a guildConfig
   * @param guild The guild ID to create a config for
   */

  public async updateGuildConfig(guild: DiscordSnowflake, config: HibikiGuildConfig) {
    if (!guild?.length) return;

    await this.client.guildConfig.update({
      where: {
        guild_id: guild,
      },
      data: config,
    });
  }

  /**
   * Creates a blank guildConfig
   * @param guild The guild ID to create a config for
   */

  public async createBlankGuildConfig(guild: DiscordSnowflake) {
    if (!guild?.length) return;

    // Creates the guildConfig entry if it doesn't exist
    await this.client.guildConfig.upsert({
      where: {
        guild_id: guild,
      },
      update: {
        guild_id: guild,
      },
      create: {
        guild_id: guild,
      },
    });
  }

  /**
   * Deletes a a guildConfig
   * @param guild The guild ID to delete a config for
   */

  public async deleteGuildConfig(guild: DiscordSnowflake) {
    if (!guild?.length) return;

    // Creates the guildConfig entry if it doesn't exist
    await this.client.guildConfig.delete({
      where: {
        guild_id: guild,
      },
    });
  }

  /**
   * Gets a userConfig
   * @param user The user ID to search for a config for
   */

  public async getUserConfig(user: DiscordSnowflake) {
    if (!user?.length) return;

    // Looks for the guildconfig
    const config = await this.client.userConfig.findUnique({
      where: {
        user_id: user,
      },
    });

    if (!config || !config?.user_id?.length) return;
    return JSON.stringify(config) as HibikiUserConfig;
  }

  /**
   * Updates a userConfig
   * @param user The user ID to create a config for
   */

  public async updateUserConfig(user: DiscordSnowflake, config: HibikiUserConfig) {
    if (!user?.length) return;

    await this.client.userConfig.update({
      where: {
        user_id: user,
      },
      data: config,
    });
  }

  /**
   * Creates a blank userConfig
   * @param user The user ID to create a config for
   */

  public async createBlankUserConfig(user: DiscordSnowflake) {
    if (!user?.length) return;

    // Creates the guildConfig entry if it doesn't exist
    await this.client.userConfig.upsert({
      where: {
        user_id: user,
      },
      update: {
        user_id: user,
      },
      create: {
        user_id: user,
      },
    });
  }

  /**
   * Deletes a a userConfig
   * @param guild The user ID to delete a config for
   */

  public async deleteUserConfig(user: DiscordSnowflake) {
    if (!user?.length) return;

    // Creates the guildConfig entry if it doesn't exist
    await this.client.userConfig.delete({
      where: {
        user_id: user,
      },
    });
  }
}
