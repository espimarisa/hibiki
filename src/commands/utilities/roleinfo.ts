import type { CommandInteraction, ApplicationCommandOptionData, EmbedField } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import { createFullTimestamp } from "../../utils/timestamp";

export class RoleinfoCommand extends HibikiCommand {
  description = "Returns information about a role.";
  options: ApplicationCommandOptionData[] = [
    {
      type: 8,
      name: "role",
      description: "The role to get information about.",
      required: true,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets the raw role info
    const role = interaction.options.getRole(this.options[0].name);

    // Handler for if a role failed to fetch
    if (!role) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_ROLEINFO_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Gets guild role info
    const guildRole = await interaction.guild?.roles.fetch(role.id);
    const fields: EmbedField[] = [];

    // ID
    fields.push({
      name: interaction.getString("global.ID"),
      value: role.id,
      inline: false,
    });

    // Created
    if (guildRole?.createdAt) {
      fields.push({
        name: interaction.getString("global.CREATED_ON"),
        value: createFullTimestamp(guildRole.createdAt),
        inline: false,
      });
    }

    // Colour
    if (role.color) {
      fields.push({
        name: interaction.getString("global.COLOUR"),
        value: `#${role.color.toString(16)}`,
        inline: false,
      });
    }

    // Managed
    if (role.managed) {
      fields.push({
        name: interaction.getString("global.MANAGED_BY_AN_INTEGRATION"),
        value: interaction.getString("global.YES"),
        inline: false,
      });
    }

    // Fully fetched role properties only
    if (guildRole) {
      // Hoisted
      if (guildRole.hoist) {
        fields.push({
          name: interaction.getString("global.HOISTED"),
          value: interaction.getString("global.YES"),
          inline: true,
        });
      }

      // Position
      if (guildRole.position) {
        fields.push({
          name: interaction.getString("global.POSITION"),
          value: guildRole.position.toString(),
          inline: true,
        });
      }
    }

    await interaction.reply({
      embeds: [
        {
          fields: fields,
          color: role.color || this.bot.config.colours.primary,
          author: {
            name: role.name,
            icon_url: interaction.guild?.iconURL({ dynamic: true }) || undefined,
          },
        },
      ],
    });
  }
}
