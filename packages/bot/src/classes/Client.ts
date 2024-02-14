import logger from "$shared/logger.ts";
import { Client, type ClientOptions } from "oceanic.js";

export class HibikiClient extends Client {
  constructor(options: ClientOptions) {
    super(options);

    this.on("error", (err) => {
      throw new Error(Bun.inspect(err));
    });
  }

  public init() {
    try {
      this.connect().catch((error) => {
        logger.error("An error occured while connecting to Discord:", Bun.inspect(error));
      });

      this.once("ready", () => {
        logger.info(`Logged in to Discord as ${this.user.tag}`);
      });
    } catch (error) {
      logger.error("An error occured while starting:", Bun.inspect(error));
    }
  }
}
