import { HibikiEvent, type HibikiEventListener } from "$classes/Event.ts";
import { DISCORD_BOT_TOKEN_REGEX, HibikiColors } from "$utils/constants.ts";
import { t } from "$utils/i18n.ts";
import { logger } from "$utils/logger.ts";

import type {
  ChatInputCommandInteraction,
  ContextMenuCommandInteraction,
  UserContextMenuCommandInteraction,
} from "discord.js";

// Possible command interaction types
export type PossibleCommandInteractionType =
  | ChatInputCommandInteraction
  | ContextMenuCommandInteraction
  | UserContextMenuCommandInteraction;

export class HibikiInteractionEvent extends HibikiEvent {
  events: HibikiEventListener[] = ["interactionCreate"];

  async run(_event: HibikiEventListener[], interaction: PossibleCommandInteractionType) {
    if (!(interaction.commandName && interaction.isCommand())) {
      return;
    }

    // Searches for the right command to run
    const command = this.bot.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    // Logs when a command is ran
    const guildName = interaction.guild?.name && interaction.guild?.id ? interaction.guild.name : "DM";
    const guildId = interaction.guild?.id ?? "DM";
    logger.info(`${interaction.user.tag}/${interaction.user.id}:${guildName}/${guildId}: ${interaction.commandName}`);

    try {
      // Defers and runs the command
      await interaction.deferReply({ ephemeral: command.ephemeral });
      await command.runCommand(interaction);
    } catch (error) {
      // Localized error message
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { locale: interaction.locale }),
            description: t("errors:ERROR_DESCRIPTION", {
              locale: interaction.locale,
              error: (error as Error).message.replace(DISCORD_BOT_TOKEN_REGEX, "token"),
            }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

      throw new Error(Bun.inspect(error));
    }
  }
}
