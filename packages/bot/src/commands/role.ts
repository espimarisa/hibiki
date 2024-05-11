import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$utils/i18n.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";

export class RoleCommand extends HibikiCommand {
  options = [
    {
      // The role to fetch information about
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ] satisfies HibikiCommandOptions[];

  public async runCommand(interaction: ChatInputCommandInteraction) {
    // Fetches the role selected
    const roleToFetch = interaction.options.getRole((this.options as APIOption[])[0]!.name);
    const fields: EmbedField[] = [];

    // Error handler
    const errorMessage = async () =>
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: t("errors:ERROR_ROLE", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

    // Argument error handler
    if (!roleToFetch) {
      await errorMessage();
      return;
    }

    // Gets guild role info
    const role =
      interaction.guild!.roles.cache.find((r) => r.name === roleToFetch.name) ||
      (await interaction.guild!.roles.fetch(roleToFetch.id));

    // General error handler
    if (!role) {
      await errorMessage();
      return;
    }

    // ID
    fields.push({
      name: t("global:ID", { lng: interaction.locale }),
      value: role.id,
      inline: false,
    });

    // Color
    if (role.color) {
      fields.push({
        name: t("global:COLOR", { lng: interaction.locale }),
        value: `#${role.color.toString(16)}`,
        inline: false,
      });
    }

    // Managed
    if (role.managed) {
      fields.push({
        name: t("global:MANAGED", { lng: interaction.locale }),
        value: t("booleans:YES", { lng: interaction.locale }),
        inline: false,
      });
    }

    // Creation date
    if (role.createdAt) {
      fields.push({
        name: t("global:CREATED_ON", { lng: interaction.locale }),
        value: createFullTimestamp(role.createdAt),
        inline: false,
      });
    }

    // Hoisted
    if (role.hoist) {
      fields.push({
        name: t("global:HOISTED", { lng: interaction.locale }),
        value: t("booleans:YES", { lng: interaction.locale }),
        inline: false,
      });
    }

    // Position
    if (role.position) {
      fields.push({
        name: t("global:POSITION", { lng: interaction.locale }),
        value: role.position.toString(),
        inline: false,
      });
    }

    // Sends role information
    await interaction.followUp({
      embeds: [
        {
          fields: fields,
          color: role.color || HibikiColors.GENERAL,
          author: {
            name: role.unicodeEmoji ? `${role.unicodeEmoji} ${role.name}` : role.name,
            icon_url: interaction.guild?.iconURL() ?? "",
          },
          thumbnail: {
            url: role?.iconURL()?.toString() ?? "",
          },
        },
      ],
    });
  }
}
