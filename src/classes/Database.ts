import type { HibikiGuildConfig, HibikiUserConfig } from "../typings/database.js";
import { PrismaClient } from "@prisma/client";
import util from "node:util";

export class DatabaseManager {
  protected readonly client: PrismaClient;

  constructor() {
    this.client = new PrismaClient();
  }

  // Gets a guildConfig
  public async getGuildConfig(guild: DiscordSnowflake): Promise<HibikiGuildConfig | undefined> {
    if (!guild?.length) return;

    // Looks for the guildconfig
    const config = await this.client.guildConfig.findUnique({
      where: {
        guild_id: guild,
      },
    });

    if (!config?.guild_id?.length) return;

    try {
      // Parses the config and returns it
      const parsedConfig = JSON.stringify(config);
      if (!parsedConfig) return;
      return parsedConfig as unknown as HibikiGuildConfig;
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }

  // Updates a guildConfig
  public async updateGuildConfig(guild: DiscordSnowflake, config: HibikiGuildConfig) {
    if (!guild?.length) return;

    await this.client.guildConfig.update({
      where: {
        guild_id: guild,
      },
      data: config,
    });
  }

  // Creates a blank guildConfig
  public async createBlankGuildConfig(guild: DiscordSnowflake) {
    if (!guild?.length) return;

    try {
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
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }

  // Deletes a a guildConfig
  public async deleteGuildConfig(guild: DiscordSnowflake) {
    if (!guild?.length) return;

    try {
      // Deletes the entry
      await this.client.guildConfig.delete({
        where: {
          guild_id: guild,
        },
      });
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }

  // Gets a userConfig
  public async getUserConfig(user: DiscordSnowflake): Promise<HibikiUserConfig | undefined> {
    if (!user?.length) return;

    // Looks for the guildconfig
    const config = await this.client.userConfig.findUnique({
      where: {
        user_id: user,
      },
    });

    if (!config?.user_id?.length) return;

    try {
      // Parses the config and returns it
      const parsedConfig = JSON.stringify(config);
      if (!parsedConfig) return;
      return parsedConfig as unknown as HibikiUserConfig;
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }

  // Updates a userConfig
  public async updateUserConfig(user: DiscordSnowflake, config: HibikiUserConfig) {
    if (!user?.length) return;

    try {
      // Updates the userConfig
      await this.client.userConfig.update({
        where: {
          user_id: user,
        },
        data: config,
      });
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }

  // Creates a blank userConfig
  public async createBlankUserConfig(user: DiscordSnowflake) {
    if (!user?.length) return;

    try {
      // Creates the blank userConfig
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
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }

  // Deletes a userConfig
  public async deleteUserConfig(user: DiscordSnowflake) {
    if (!user?.length) return;

    try {
      // Deletes the userConfig
      await this.client.userConfig.delete({
        where: {
          user_id: user,
        },
      });
    } catch (error) {
      throw new Error(`${util.inspect(error)}`);
    }
  }
}
