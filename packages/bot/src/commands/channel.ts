import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
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

    const errorMessage = async () =>
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR", { lng: interaction.locale, ns: "errors" }),
            description: t("ERROR_CHANNEL", { lng: interaction.locale, ns: "errors" }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("ERROR_FOUND_A_BUG", { lng: interaction.locale, ns: "errors" }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

    // Argument error handler
    if (!channelToFetch) {
      await errorMessage();
      return;
    }

    // Gets guild channel info
    const channel =
      interaction.guild!.channels.cache.find((c) => c.name === channelToFetch.name) ||
      (await interaction.guild!.channels.fetch(channelToFetch.id));

    // Error handler
    if (!channel) {
      await errorMessage();
      return;
    }

    // ID
    fields.push({
      name: t("ID", { lng: interaction.locale, ns: "global" }),
      value: channel.id,
      inline: false,
    });

    // Type
    fields.push({
      name: t("CHANNEL_TYPE", { lng: interaction.locale, ns: "global" }),
      value: localizeChannelType(channel.type, interaction.locale),
      inline: false,
    });

    // Creation date
    if (channel.createdAt) {
      fields.push({
        name: t("CREATED_ON", { lng: interaction.locale, ns: "global" }),
        value: createFullTimestamp(channel.createdAt),
        inline: false,
      });
    }

    // Thread only information
    if (channel.parent) {
      fields.push({
        name: t("PARENT", { lng: interaction.locale, ns: "global" }),
        value: channel.parent.name,
        inline: false,
      });
    }

    // Text only options
    if (channel.type === ChannelType.GuildText || channel.type === ChannelType.GuildAnnouncement) {
      // Thread amounts
      if (channel.threads.cache.size) {
        fields.push({
          name: t("THREADS", { lng: interaction.locale, ns: "global" }),
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
        name: t("POSITION", { lng: interaction.locale, ns: "global" }),
        value: (channel.position + 1).toString(),
        inline: false,
      });

      // NSFW channel?
      if (channel.nsfw) {
        fields.push({
          name: t("NSFW", { lng: interaction.locale, ns: "global" }),
          value: t("YES", { lng: interaction.locale, ns: "booleans" }),
          inline: false,
        });
      }
    }

    // Voice only and stage options
    if (channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice) {
      // Bitrate
      fields.push({
        name: t("BITRATE", { lng: interaction.locale, ns: "global" }),
        value: t("BITRATE_DATA", { bitrate: channel.bitrate / 1000, lng: interaction.locale, ns: "global" }),
        inline: false,
      });
    }

    // Category only options
    if (channel.type === ChannelType.GuildCategory && channel.children.cache.size) {
      // Children channel amount
      fields.push({
        name: t("CHILDREN", { lng: interaction.locale, ns: "global" }),
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
            icon_url: interaction.guild?.iconURL() ?? "",
          },
        },
      ],
    });
  }
}
