import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { HibikiCommand } from "../classes/Command.js";
import { createFullTimestamp } from "../utils/timestamp.js";
import { HibikiColors } from "$shared/constants.js";
import { t } from "$shared/i18n.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

export class RoleinfoCommand extends HibikiCommand {
  description = "Provides information about a role.";
  options: APIApplicationCommandOption[] = [
    {
      type: ApplicationCommandOptionType.Role,
      name: "role",
      description: "The role to return information about.",
      required: true,
    },
  ];

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets the raw role info
    const role = interaction.options.getRole(this.options[0].name);

    // Handler for if a role failed to fetch
    if (!role) {
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR_TITLE"),
            description: t("COMMAND_ROLEINFO_FAILED"),
            color: HibikiColors.ERROR,
          },
        ],
      });

      return;
    }

    // Gets guild role info
    const guildRole = await interaction.guild?.roles.fetch(role.id);
    const fields: EmbedField[] = [];

    // ID
    fields.push({
      name: t("ID", { lng: interaction.lng }),
      value: role.id,
      inline: false,
    });

    // Created
    if (guildRole?.createdAt) {
      fields.push({
        name: t("CREATED_ON", { lng: interaction.lng }),
        value: createFullTimestamp(guildRole.createdAt),
        inline: false,
      });
    }

    // Colour
    if (role.color) {
      fields.push({
        name: t("COLOR", { lng: interaction.lng }),
        value: `#${role.color.toString(16)}`,
        inline: false,
      });
    }

    // Managed
    if (role.managed) {
      fields.push({
        name: t("MANAGED_BY_AN_INTEGRATION", { lng: interaction.lng }),
        value: t("YES", { lng: interaction.lng }),
        inline: false,
      });
    }

    if (guildRole) {
      // Hoisted
      if (guildRole.hoist) {
        fields.push({
          name: t("HOISTED", { lng: interaction.lng }),
          value: t("YES", { lng: interaction.lng }),
          inline: false,
        });
      }

      // Position
      if (guildRole.position) {
        fields.push({
          name: t("POSITION", { lng: interaction.lng }),
          value: guildRole.position.toString(),
          inline: false,
        });
      }
    }

    await interaction.followUp({
      embeds: [
        {
          fields: fields,
          title: guildRole?.unicodeEmoji ? `${guildRole.unicodeEmoji} ${role.name}` : role.name,
          color: role.color || HibikiColors.GENERAL,
          author: {
            name: guildRole?.iconURL() ? guildRole.name : "",
            icon_url: guildRole?.iconURL() ?? "",
          },
        },
      ],
    });
  }
}
