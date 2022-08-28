import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import fetch from "../../utils/fetch.js";

export class CatgirlCommand extends HibikiCommand {
  description = "Sends a random picture of a catgirl.";

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // TODO: Use our own API
    const body: NekobotImage = await fetch("https://nekobot.xyz/api/image?type=neko");

    if (!body || !body?.message) {
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
          title: interaction.getString("image.COMMAND_CATGIRL_TITLE"),
          color: this.bot.config.colours.primary,
          image: {
            url: body.message,
          },
          footer: {
            icon_url: this.bot.user?.displayAvatarURL(),
            text: interaction.getString("global.POWERED_BY", { url: "api.nekobot.xyz" }),
          },
        },
      ],
    });
  }
}
