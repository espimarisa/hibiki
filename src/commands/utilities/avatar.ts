import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class AvatarCommand extends HibikiCommand {
  description = "Display's a member's account avatar.";
  options: ApplicationCommandOptionData[] = [
    {
      type: 6,
      name: "member",
      description: "The member to pull an avatar from.",
      required: true,
    },
    {
      type: 5,
      name: "default",
      description: "Whether or not to display the member's default Discord avatar.",
      required: false,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets the raw member user info
    const member = await interaction.options.getUser(this.options[0].name)?.fetch();
    const defaultAvatar = interaction.options.getBoolean(this.options[1].name);

    // Handler for if a member failed to fetch
    if (!member) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_USERINFO_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Chooses between avatar & default avatar
    const avatar = defaultAvatar ? member.defaultAvatarURL : member.displayAvatarURL({ dynamic: true, size: 1024 });

    await interaction.reply({
      embeds: [
        {
          color: this.bot.config.colours.primary,
          author: {
            icon_url: avatar,
            name: interaction.getString("utilities.COMMAND_AVATAR_DESCRIPTION", {
              username: member.tag,
              type: defaultAvatar ? 0 : 1,
            }),
          },
          image: {
            url: avatar,
          },
        },
      ],
    });
  }
}