import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { t } from "$utils/i18n.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction, type EmbedField } from "discord.js";

export class AvatarCommand extends HibikiCommand {
  options = [
    {
      // The account to get information about
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      // Whether or not to fetch server-specific data
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
    // TODO: Add a feature for fetching "outsider" REST USER information by ID
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the member data; defaults to the runner. Also checks to see if we should return server-only info
    const memberToFetch = await interaction.options.getUser((this.options as APIOption[])[0]!.name)?.fetch();
    const serverInfo = interaction.options.getBoolean((this.options as APIOption[])[1]!.name);
    const idToFetch = memberToFetch?.id ?? interaction.user.id;
    const fields: EmbedField[] = [];

    // Error handler for no guild
    if (!interaction.guild) {
      await sendErrorReply("errors:ERROR_SERVER", interaction);
      return;
    }

    // Fetches the member
    const member =
      interaction.guild.members.cache.find((m) => m.id === idToFetch) ||
      (await interaction.guild.members.fetch(idToFetch));

    // Error handler for no member
    if (!member) {
      await sendErrorReply("errors:ERROR_ACCOUNT", interaction);
      return;
    }

    // ID
    fields.push({
      name: t("global:ID", { lng: interaction.locale }),
      value: member.id.toString(),
      inline: false,
    });

    // Global ("new") display name
    if (member.user.globalName) {
      fields.push({
        name: t("global:DISPLAY_NAME", { lng: interaction.locale }),
        value: member.user.globalName,
        inline: true,
      });
    }

    // Username ("new") handle or "old" username
    fields.push({
      name: t("global:USERNAME", { lng: interaction.locale }),
      value: member.user.discriminator ? member.user.tag : member.user.username,
      inline: true,
    });

    // App note
    if (member.user.bot) {
      fields.push({
        name: t("commands:COMMAND_ACCOUNT_APP_ACCOUNT", { lng: interaction.locale }),
        value: t("booleans:YES", { lng: interaction.locale }),
        inline: true,
      });
    }

    // Creation date
    fields.push({
      name: t("global:CREATED_ON", { lng: interaction.locale }),
      value: createFullTimestamp(member.user.createdAt),
      inline: false,
    });

    // Server-related information only
    if (serverInfo) {
      // Server join date
      if (member.joinedAt) {
        fields.push({
          name: t("global:JOINED_ON", { lng: interaction.locale }),
          value: createFullTimestamp(member.joinedAt),
          inline: false,
        });
      }

      // Server nickname
      if (member.nickname) {
        fields.push({
          name: t("global:NICKNAME", { lng: interaction.locale }),
          value: member.nickname,
          inline: true,
        });
      }

      // Highest role
      if (member.roles) {
        fields.push({
          name: t("commands:COMMAND_ACCOUNT_HIGHEST_ROLE", { lng: interaction.locale }),
          value: member.roles.highest.name,
          inline: true,
        });
      }
    }

    // Sends the account data
    await interaction.followUp({
      embeds: [
        {
          author: {
            name: member.user.tag,
            icon_url: serverInfo
              ? member.displayAvatarURL({ size: 2048 })
              : member.user.displayAvatarURL({ size: 2048 }),
          },
          fields: fields,
          color: member.user.accentColor ?? HibikiColors.GENERAL,
          thumbnail: {
            url: serverInfo ? member.displayAvatarURL({ size: 2048 }) : member.user.displayAvatarURL({ size: 2048 }),
          },
          image: {
            url: member.user.bannerURL({ size: 2048 }) ?? "",
          },
        },
      ],
    });
  }
}
