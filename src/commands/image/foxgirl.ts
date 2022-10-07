import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import fetch from "../../utils/fetch.js";

export class FoxgirlCommand extends HibikiCommand {
  description = "Sends a random picture of a foxgirl.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // TODO:: Use our own API.
    const response = await fetch("https://nekos.life/api/v2/img/fox_girl");
    const body = await response?.json();

    if (!body || body?.msg || !body.url) {
      await interaction.followUp({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("image.COMMAND_IMAGE_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    await interaction.followUp({
      embeds: [
        {
          title: interaction.getString("image.COMMAND_FOXGIRL_TITLE"),
          color: this.bot.config.colours.primary,
          image: {
            url: body.url,
          },
          footer: {
            icon_url: this.bot.user?.displayAvatarURL(),
            text: interaction.getString("global.POWERED_BY", { url: "nekos.life/api/" }),
          },
        },
      ],
    });
  }
}
