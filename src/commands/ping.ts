import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { HibikiColors } from "../utils/constants.js";

export class HibikiPingCommand extends HibikiCommand {
  description = "Checks the current status and latency.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {}
}
