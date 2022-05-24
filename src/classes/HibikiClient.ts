/**
 * @file Client
 * @description Connects to Discord and handles global functions
 */

import { Client, Intents } from "discord.js";

export class HibikiClient extends Client {
  readonly config: HibikiConfig;

  constructor(config: HibikiConfig) {
    super({
      ...config.options,
      intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES],
    });

    this.config = config;

    this.once("ready", async () => this.init());
  }

  public init() {
    this.login(this.config.hibiki.token).then(async () => {
      console.log(`Signed in as ${this.user?.tag}`);
    });
  }
}
