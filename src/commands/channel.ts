import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { t } from "$utils/i18n.ts";
import { localizeChannelType } from "$utils/localize.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import { ChannelType, type ChatInputCommandInteraction, type EmbedField } from "discord.js";

export class ChannelCommand extends HibikiCommand {
  options = [
    {
      // The channel to fetch information about
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ] satisfies HibikiCommandOptions[];

  public async runCommand(interaction: ChatInputCommandInteraction) {
    // Fetches the channel selected
    const channelToFetch = interaction.options.getChannel((this.options as APIOption[])[0]!.name);
    const fields: EmbedField[] = [];

    // Argument error handler
    if (!channelToFetch) {
      await sendErrorReply("errors:ERROR_CHANNEL", interaction);
      return;
    }

    // Guild error handler
    if (!interaction.guild) {
      await sendErrorReply("errors:ERROR_SERVER", interaction);
      return;
    }

    // Gets channel info
    const channel =
      interaction.guild.channels.cache.find((c) => c.name === channelToFetch.name) ||
      (await interaction.guild.channels.fetch(channelToFetch.id));

    // Channel error handler
    if (!channel) {
      await sendErrorReply("errors:ERROR_CHANNEL", interaction);
      return;
    }

    // ID
    fields.push({
      name: t("global:ID", { lng: interaction.locale }),
      value: channel.id,
      inline: false,
    });

    // Type
    fields.push({
      name: t("global:CHANNEL_TYPE", { lng: interaction.locale }),
      value: localizeChannelType(channel.type, interaction.locale),
      inline: false,
    });

    // Creation date
    if (channel.createdAt) {
      fields.push({
        name: t("global:CREATED_ON", { lng: interaction.locale }),
        value: createFullTimestamp(channel.createdAt),
        inline: false,
      });
    }

    // Thread only information
    if (channel.parent) {
      fields.push({
        name: t("global:PARENT", { lng: interaction.locale }),
        value: channel.parent.name,
        inline: false,
      });
    }

    // Text only options
    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
      // Thread amounts
      if (channel.threads.cache.size) {
        fields.push({
          name: t("global:THREADS", { lng: interaction.locale }),
          value: channel.threads.cache.size.toString(),
          inline: false,
        });
      }
    }

    // Additional shared between voice, text, and announcement channels
    if (
      channel.type === ChannelType.GuildText ||
      channel.type === ChannelType.GuildVoice ||
      channel.type === ChannelType.GuildAnnouncement
    ) {
      // Position
      fields.push({
        name: t("global:POSITION", { lng: interaction.locale }),
        value: (channel.position + 1).toString(),
        inline: false,
      });

      // NSFW channel?
      if (channel.nsfw) {
        fields.push({
          name: t("global:NSFW", { lng: interaction.locale }),
          value: t("booleans:YES", { lng: interaction.locale }),
          inline: false,
        });
      }
    }

    // Voice only and stage options
    if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
      // Bitrate
      fields.push({
        name: t("global:BITRATE", { lng: interaction.locale }),
        value: t("global:BITRATE_DATA", { bitrate: channel.bitrate / 1000, lng: interaction.locale }),
        inline: false,
      });
    }

    // Category only options
    if (channel.type === ChannelType.GuildCategory && channel.children.cache.size) {
      // Children channel amount
      fields.push({
        name: t("global:CHILDREN", { lng: interaction.locale }),
        value: channel.children.cache.size.toString(),
        inline: false,
      });
    }

    // Sends channel information
    await interaction.followUp({
      embeds: [
        {
          description: channel.type === ChannelType.GuildText ? channel.topic?.substring(0, 200) : undefined,
          fields: fields,
          color: HibikiColors.GENERAL,
          author: {
            name: channel.name,
            url: channel.url,
            icon_url: interaction.guild.iconURL() ?? "",
          },
        },
      ],
    });
  }
}
