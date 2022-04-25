import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";

export class FoxgirlCommand extends HibikiCommand {
  description = "Sends a random picture of a foxgirl.";

  public async runWithInteraction(interaction: CommandInteraction) {
    const body = await fetch("https://nekos.life/api/v2/img/fox_girl");

    const response: NekosLifeImage = await body.json();

    if (!body || !response || response.msg || !response.url) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("image.COMMAND_IMAGE_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    await interaction.reply({
      embeds: [
        {
          title: interaction.getString("image.COMMAND_FOXGIRL_TITLE"),
          color: this.bot.config.colours.primary,
          image: {
            url: response.url,
          },
          footer: {
            icon_url: this.bot.user?.displayAvatarURL({ dynamic: true }),
            text: interaction.getString("global.POWERED_BY", { url: "nekos.life/api/" }),
          },
        },
      ],
    });
  }
}
