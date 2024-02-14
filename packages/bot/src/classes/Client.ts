import env from "$shared/env.ts";
import logger from "$shared/logger.ts";
import { Client, type ClientOptions } from "discord.js";

export class HibikiClient extends Client {
  constructor(options: ClientOptions) {
    super(options);

    // Logs errors
    this.on("error", (err) => {
      logger.error(Bun.inspect(err));
    });
  }

  public init() {
    try {
      this.login(env.BOT_TOKEN).catch((error) => {
        throw new Error(Bun.inspect(error));
      });

      this.once("ready", () => {
        logger.info("Logged in to Discord");
      });
    } catch (error) {
      logger.error(`An error occured while starting:`);
      throw new Error(Bun.inspect(error));
    }
  }
}
