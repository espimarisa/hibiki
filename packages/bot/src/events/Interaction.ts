import { HibikiEvent, type HibikiEventListener } from "$classes/Event.ts";
import { getUserConfig } from "$db/index.ts";
import { DISCORD_BOT_TOKEN_REGEX, HibikiColors } from "$shared/constants.ts";
import { env } from "$shared/env.ts";
import { t } from "$shared/i18n.ts";
import { logger } from "$shared/logger.ts";
import type { ChatInputCommandInteraction, ContextMenuCommandInteraction } from "discord.js";

export class HibikiInteractionEvent extends HibikiEvent {
  locale?: string;
  events: HibikiEventListener[] = ["interactionCreate"];

  async run(_event: HibikiEventListener[], interaction: ChatInputCommandInteraction | ContextMenuCommandInteraction) {
    // Don't run any interactions that aren't commands or that don't actually exist
    if (!(interaction.commandName && interaction.isCommand())) {
      return;
    }

    // Searches for the right command to run
    const command = this.bot.commands.get(interaction.commandName);
    if (!command) {
      return;
    }

    // Gets the user's locale and appends it to the class
    const userConfig = await getUserConfig(interaction.user.id);
    this.locale = userConfig?.locale ?? env.DEFAULT_LOCALE;

    // Logs when an interaction is ran
    logger.info(
      `${interaction.user.tag}/${interaction.user.id} ran ${interaction.commandName} in ${
        interaction.guild?.name ?? "DM"
      }/${interaction.guild?.id ?? "DM"}`,
    );

    try {
      // Defers the command for a followup. If ephemeral is set, set the flag
      await interaction.deferReply({ ephemeral: command.ephemeral });

      // Runs the command
      await command.runWithInteraction?.(interaction);
    } catch (error) {
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR", { locale: this.locale }),
            description: t("ERROR_DESCRIPTION", {
              error: (error as Error).message.replace(DISCORD_BOT_TOKEN_REGEX, "token"),
            }),
            color: HibikiColors.ERROR,
            footer: {
              text: `${t("ERROR_FOUND_A_BUG", { lng: this.locale })} - github.com/espimarisa/hibiki/issues`,
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

      throw new Error(Bun.inspect(error));
    }
  }
}
