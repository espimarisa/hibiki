import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { createFullTimestamp } from "../../utils/timestamp.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export class UserinfoCommand extends HibikiCommand {
  description = "Returns information about a member's account.";
  options: APIApplicationCommandOption[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: "member",
      description: "The server member to return information about.",
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
            description: interaction.getString("general.COMMAND_USERINFO_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Gets the guild member info
    const guildMember = await interaction.guild?.members.fetch(member.id);
    const fields: EmbedField[] = [];

    fields.push(
      {
        // ID
        name: interaction.getString("global.ID"),
        value: member.id,
        inline: false,
      },
      {
        // Account creation date
        name: interaction.getString("global.ACCOUNT_CREATED"),
        value: createFullTimestamp(member.createdAt),
        inline: false,
      },
    );

    // Join date
    if (guildMember?.joinedAt) {
      fields.push({
        name: interaction.getString("global.ACCOUNT_JOINED"),
        value: createFullTimestamp(guildMember.joinedAt),
        inline: false,
      });
    }

    // Nickname
    if (guildMember?.nickname) {
      fields.push({
        name: interaction.getString("global.NICKNAME"),
        value: guildMember.nickname,
        inline: true,
      });
    }

    // Highest role
    if (guildMember?.roles.highest) {
      fields.push({
        name: interaction.getString("global.HIGHEST_ROLE"),
        value: guildMember.roles.highest.name,
        inline: true,
      });
    }

    await interaction.followUp({
      embeds: [
        {
          color: member.accentColor || this.bot.config.colours.primary,
          fields: fields,
          author: {
            name: member.tag,
            icon_url: member.displayAvatarURL(),
          },

          thumbnail: {
            url: member.displayAvatarURL({ size: 1024 }),
          },
          image: {
            url: member.bannerURL({ size: 1024 }) ?? "",
          },
        },
      ],
    });
  }
}
