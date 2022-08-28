import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export class BannerCommand extends HibikiCommand {
  description = "Displays a member's profile banner.";
  options: APIApplicationCommandOption[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: "member",
      description: "The member to get a banner from.",
      required: true,
    },
  ];

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets the raw member user info
    const member = await interaction.options.getUser(this.options[0].name)?.fetch();

    // Handler for if a member failed to fetch
    if (!member) {
      await interaction.followUp({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_BANNER_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Handler for if the member doesn't have a banner
    if (!member.bannerURL()) {
      await interaction.followUp({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_BANNER_EMPTY", { username: member.tag }),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Sends the banner
    await interaction.followUp({
      embeds: [
        {
          color: this.bot.config.colours.primary,
          author: {
            name: interaction.getString("general.COMMAND_BANNER_DESCRIPTION", { username: member.tag }),
            icon_url: member.displayAvatarURL(),
          },
          image: {
            url: member.bannerURL({ size: 1024 }) ?? "",
          },
        },
      ],
    });
  }
}
