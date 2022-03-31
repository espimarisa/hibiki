import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";

export class CatgirlCommand extends HibikiCommand {
  description = "Sends a random picture of a catgirl.";

  public async runWithInteraction(interaction: CommandInteraction) {
    const body = await fetch("https://nekobot.xyz/api/image?type=neko");

    const response: NekobotImage = await body.json();

    if (!body || !response || !response.message) {
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
          title: interaction.getString("image.COMMAND_CATGIRL_TITLE"),
          color: this.bot.config.colours.primary,
          image: {
            url: response.message,
          },
          footer: {
            icon_url: this.bot.user?.displayAvatarURL({ dynamic: true }),
            text: interaction.getString("global.POWERED_BY", { url: "api.nekobot.xyz" }),
          },
        },
      ],
    });
  }
}
