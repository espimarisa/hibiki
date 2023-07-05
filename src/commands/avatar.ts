import { HibikiCommand } from "../classes/Command.js";
import { ApplicationCommandType, type ChatInputCommandInteraction } from "discord.js";

export class HibikiAvatarCommand extends HibikiCommand {
  description = "Displays a user's avatar.";
  interactionType = ApplicationCommandType.User;
  ephemeral = true;

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
      
  }
}
