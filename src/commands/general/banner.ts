import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class BannerCommand extends HibikiCommand {
  description = "Displays a member's profile banner.";
  options: ApplicationCommandOptionData[] = [
    {
      type: 6,
      name: "member",
      description: "The member to get a banner from.",
      required: true,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets the raw member user info
    const member = await interaction.options.getUser(this.options[0].name)?.fetch();

    // Handler for if a member failed to fetch
    if (!member) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_BANNER_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Handler for if the member doesn't have a banner
    if (!member.bannerURL({ dynamic: true })) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_BANNER_EMPTY", { username: member.tag }),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Sends the banner
    await interaction.reply({
      embeds: [
        {
          color: this.bot.config.colours.primary,
          author: {
            name: interaction.getString("general.COMMAND_BANNER_DESCRIPTION", { username: member.tag }),
            icon_url: member.displayAvatarURL({ dynamic: true }),
          },
          image: {
            url: member.bannerURL({ dynamic: true, size: 1024 })?.toString(),
          },
        },
      ],
    });
  }
}
