import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";

export class XKCDCommand extends HibikiCommand {
  options = [
    {
      // The XKCD number to get
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Fetches the default/daily comic
    const res = await fetch("https://xkcd.com/info.0.json");
    const body = await res?.json();

    if (!(res && body)) {
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: t("errors:ERROR_IMAGE", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

      return;
    }

    console.table(body);

    // Sends the image
    await interaction.followUp({
      embeds: [
        {
          title: t("errors:ERROR"),
          color: HibikiColors.GENERAL,
          footer: {
            text: "dwqmkokewf",
            icon_url: this.bot.user?.displayAvatarURL(),
          },
        },
      ],
    });
  }
}
