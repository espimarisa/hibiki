/**
 * @file Ping
 * @description Ping command
 */

import { HibikiCommand } from "../classes/Command.js";

export class HibikiPingCommand extends HibikiCommand {
  events: HibikiEventListener[] = ["messageCreate"];
  description = "Checks the current status and latency.";

  public async runWithInteraction() {
    console.log("This is an Interaction test. Hello!");
  }
}
