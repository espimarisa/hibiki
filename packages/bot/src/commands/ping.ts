import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { t } from "$shared/i18n.js";

export class HibikiPingCommand extends HibikiCommand {
  description = "wow";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // TODO: make a wrapper function so I don't have to always call lng :c
    const test = t("bot:vartest", { vartest: "now with interpolation!", lng: interaction.lng });
    await interaction.followUp(test);
  }
}
