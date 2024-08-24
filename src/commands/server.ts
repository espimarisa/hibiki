import { HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { t } from "$utils/i18n.ts";
import { createFullTimestamp } from "$utils/timestamp";
import {
  type APIEmbed,
  ApplicationCommandOptionType,
  type ChatInputCommandInteraction,
  type CommandInteraction,
  type EmbedField,
  type Guild,
} from "discord.js";

// TODO: Explicit content filter, message filtering, and more guild data
// TODO: Add an option for fetching basic REST guild data if possible
export class ServerCommand extends HibikiCommand {
  options = [
    {
      // Server information
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      // Server banner
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      // Server icon
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      // Server icon
      type: ApplicationCommandOptionType.Subcommand,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the subcommand specified
    const subcommand = interaction.options.getSubcommand(true);

    // Error handler
    if (!subcommand) {
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: t("errors:ERROR_NO_OPTION_PROVIDED", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

      return;
    }

    // Runs the subcommands
    const subcommandResponse = await this.getSubCommandResponse!(subcommand, interaction);
    await interaction.followUp({
      embeds: subcommandResponse,
    });

    return;
  }

  async getSubCommandResponse(commandName: string, interaction: CommandInteraction): Promise<APIEmbed[]> {
    // Error handler embed
    const errorEmbed = (errorString: string) => [
      // TODO: Make a utility for this in $utils/*
      {
        title: t("errors:ERROR", { lng: interaction.locale }),
        description: errorString,
        color: HibikiColors.ERROR,
        footer: {
          text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
          icon_url: this.bot.user?.displayAvatarURL(),
        },
      },
    ];

    // Embed for image returns
    const imageEmbed = (guild: Guild, url: string) => [
      {
        color: HibikiColors.GENERAL,
        author: {
          name: guild.name,
          icon_url: guild.iconURL() ?? undefined,
        },
        image: {
          url: url,
        },
      },
    ];

    switch (commandName) {
      // Server info command
      case "info": {
        // Fetches guild data
        const guild = await interaction.guild?.fetch();
        const fields: EmbedField[] = [];

        // Error handler
        if (!guild) {
          return errorEmbed(t("errors:ERROR_SERVER", { lng: interaction.locale }));
        }

        // Fetches owner and channel, role, emoji, and sticker counts
        const owner = await guild.fetchOwner();
        const totalChannels = (await interaction.guild?.channels.fetch())?.size;
        const totalRoles = (await interaction.guild?.roles.fetch())?.size;
        const totalEmojis = (await interaction.guild?.emojis.fetch())?.size;
        const totalStickers = (await interaction.guild?.stickers.fetch())?.size;

        // Guild ID
        fields.push({
          name: t("global:ID", { lng: interaction.locale }),
          value: guild.id.toString(),
          inline: false,
        });

        // Creation date
        fields.push({
          name: t("global:CREATED_ON", { lng: interaction.locale }),
          value: createFullTimestamp(guild.createdAt),
          inline: false,
        });

        // Owner
        if (owner.user) {
          fields.push({
            name: t("global:OWNER", { lng: interaction.locale }),
            value: `${owner.user.tag} (${owner.user.id})`,
            inline: false,
          });
        }

        // Total member count
        fields.push({
          name: t("global:MEMBERS", { lng: interaction.locale }),
          value: guild.memberCount.toString(),
          inline: true,
        });

        // Total channels
        if (totalChannels) {
          fields.push({
            name: t("global:CHANNELS", { lng: interaction.locale }),
            value: totalChannels.toString(),
            inline: true,
          });
        }

        // Total roles
        if (totalRoles) {
          fields.push({
            name: t("global:ROLES", { lng: interaction.locale }),
            value: totalRoles.toString(),
            inline: true,
          });
        }

        // Total emojis
        if (totalEmojis) {
          fields.push({
            name: t("global:EMOJIS", { lng: interaction.locale }),
            value: totalEmojis.toString(),
            inline: true,
          });
        }
        // Stickers
        if (totalStickers) {
          fields.push({
            name: t("global:STICKERS", { lng: interaction.locale }),
            value: totalStickers.toString(),
            inline: true,
          });
        }

        // Mobile 2FA
        fields.push({
          name: t("global:2FA", { lng: interaction.locale }),
          value: guild.mfaLevel
            ? t("booleans:YES", { lng: interaction.locale })
            : t("booleans:NO", { lng: interaction.locale }),
          inline: true,
        });

        // Vanity URL code and uses
        if (guild.vanityURLCode) {
          fields.push({
            name: t("global:VANITY_URL", { lng: interaction.locale }),
            value: `${guild.vanityURLCode} (${guild.vanityURLUses})`,
            inline: false,
          });
        }

        // Partnered guild
        if (guild.partnered) {
          fields.push({
            name: t("global:PARTNERED", { lng: interaction.locale }),
            value: t("booleans:YES", { lng: interaction.locale }),
            inline: true,
          });
        }

        // Verified guild
        if (guild.verified) {
          fields.push({
            name: t("global:VERIFIED", { lng: interaction.locale }),
            value: t("booleans:YES", { lng: interaction.locale }),
            inline: true,
          });
        }

        // Sends server information
        const embed = [
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
          },
        ];

        return embed;
      }

      // Server banner
      case "banner": {
        if (!interaction.guild?.bannerURL()) {
          // Error handler
          return errorEmbed(t("errors:ERROR_NO_BANNER", { lng: interaction.locale }));
        }

        return imageEmbed(interaction.guild, interaction.guild.bannerURL({ size: 2048 })!.toString());
      }

      // Server icon
      case "icon": {
        if (!interaction.guild?.iconURL()) {
          // Error handler
          return errorEmbed(t("errors:ERROR_NO_ICON", { lng: interaction.locale }));
        }

        return imageEmbed(interaction.guild, interaction.guild.iconURL({ size: 2048 })!.toString());
      }

      // Server invite banner
      case "invite-banner": {
        if (!interaction.guild?.splashURL()) {
          // Error handler
          return errorEmbed(t("errors:ERROR_NO_BANNER", { lng: interaction.locale }));
        }

        return imageEmbed(interaction.guild, interaction.guild.splashURL({ size: 2048 })!.toString());
      }

      default:
        return errorEmbed(t("errors:ERROR_NO_OPTION_PROVIDED"));
    }
  }
}
