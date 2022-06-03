/**
 * @file Config
 * @description Typings for a Hibiki config file
 * @typedef config
 */

type PrivateClientOptions = import("discord.js").ClientOptions;

type HibikiCoreOptions = {
  token: string;
};

interface HibikiConfig {
  hibiki: HibikiCoreOptions;
  options?: PrivateClientOptions | Record<string, never>;
}
