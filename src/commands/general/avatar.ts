import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export class AvatarCommand extends HibikiCommand {
  description = "Display's a member's account avatar.";
  options: APIApplicationCommandOption[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: "member",
      description: "The member to pull an avatar from.",
      required: true,
    },
    {
      type: ApplicationCommandOptionType.Boolean,
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
            description: interaction.getString("general.COMMAND_USERINFO_FAILED"),
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
            name: interaction.getString("general.COMMAND_AVATAR_DESCRIPTION", {
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
