import { HibikiCommand } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";

// TODO: Explicit content filter, message filtering, and more guild data
// TODO: Add an option for fetching basic REST guild data if possible
export class ServerCommand extends HibikiCommand {
  async runCommand(interaction: ChatInputCommandInteraction) {
    // Fetches guild data
    const guild = await interaction.guild?.fetch();
    const fields: EmbedField[] = [];

    // Error handler
    if (!guild) {
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR", { lng: interaction.locale, ns: "errors" }),
            description: t("ERROR_SERVER", { lng: interaction.locale, ns: "errors" }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("ERROR_FOUND_A_BUG", { lng: interaction.locale, ns: "errors" }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

      return;
    }

    // Fetches owner and channel, role, emoji, and sticker counts
    const owner = await guild.fetchOwner();
    const totalChannels = (await interaction.guild?.channels.fetch())?.size;
    const totalRoles = (await interaction.guild?.roles.fetch())?.size;
    const totalEmojis = (await interaction.guild?.emojis.fetch())?.size;
    const totalStickers = (await interaction.guild?.stickers.fetch())?.size;

    // Guild ID
    fields.push({
      name: t("ID", { lng: interaction.locale, ns: "global" }),
      value: guild.id.toString(),
      inline: false,
    });

    // Creation date
    fields.push({
      name: t("CREATED_ON", { lng: interaction.locale, ns: "global" }),
      value: createFullTimestamp(guild.createdAt),
      inline: false,
    });

    // Owner
    if (owner.user) {
      fields.push({
        name: t("OWNER", { lng: interaction.locale, ns: "global" }),
        value: `${owner.user.tag} (${owner.user.id})`,
        inline: false,
      });
    }

    // Total member count
    fields.push({
      name: t("MEMBERS", { lng: interaction.locale, ns: "global" }),
      value: guild.memberCount.toString(),
      inline: true,
    });

    // Total channels
    if (totalChannels) {
      fields.push({
        name: t("CHANNELS", { lng: interaction.locale, ns: "global" }),
        value: totalChannels.toString(),
        inline: true,
      });
    }

    // Total roles
    if (totalRoles) {
      fields.push({
        name: t("ROLES", { lng: interaction.locale, ns: "global" }),
        value: totalRoles.toString(),
        inline: true,
      });
    }

    // Total emojis
    if (totalEmojis) {
      fields.push({
        name: t("EMOJIS", { lng: interaction.locale, ns: "global" }),
        value: totalEmojis.toString(),
        inline: true,
      });
    }
    // Stickers
    if (totalStickers) {
      fields.push({
        name: t("STICKERS", { lng: interaction.locale, ns: "global" }),
        value: totalStickers.toString(),
        inline: true,
      });
    }

    // Mobile 2FA
    fields.push({
      name: t("2FA", { lng: interaction.locale, ns: "global" }),
      value: guild.mfaLevel
        ? t("YES", { lng: interaction.locale, ns: "booleans" })
        : t("NO", { lng: interaction.locale, ns: "booleans" }),
      inline: true,
    });

    // Vanity URL code and uses
    if (guild.vanityURLCode) {
      fields.push({
        name: t("VANITY_URL", { lng: interaction.locale, ns: "global" }),
        value: `${guild.vanityURLCode} (${guild.vanityURLUses})`,
        inline: false,
      });
    }

    // Partnered guild
    if (guild.partnered) {
      fields.push({
        name: t("PARTNERED", { lng: interaction.locale, ns: "global" }),
        value: t("YES", { lng: interaction.locale, ns: "booleans" }),
        inline: true,
      });
    }

    // Verified guild
    if (guild.verified) {
      fields.push({
        name: t("VERIFIED", { lng: interaction.locale, ns: "global" }),
        value: t("YES", { lng: interaction.locale, ns: "booleans" }),
        inline: true,
      });
    }

    // Sends server information
    await interaction.followUp({
      embeds: [
        {
          description: guild.description?.substring(0, 200) ?? undefined,
          color: HibikiColors.GENERAL,
          fields: fields,
          author: {
            name: guild.name,
            icon_url: guild.iconURL() ?? undefined,
          },
          thumbnail: {
            url: guild.iconURL() ?? "",
          },
          image: {
            url: guild.bannerURL({ size: 1024 }) ?? "",
          },
        },
      ],
    });
  }
}
