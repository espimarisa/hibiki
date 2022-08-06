import type { CommandInteraction, EmbedField } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { createFullTimestamp } from "../../utils/timestamp.js";

export class ServerinfoCommand extends HibikiCommand {
  description = "Returns information about the server.";

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets the guild
    const guild = await interaction.guild?.fetch();

    // Handler for if a server failed to fetch
    if (!guild) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("general.COMMAND_SERVERINFO_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    const fields: EmbedField[] = [];

    fields.push(
      {
        // ID
        name: interaction.getString("global.ID"),
        value: guild.id,
        inline: false,
      },
      {
        // Creation date
        name: interaction.getString("global.CREATED_ON"),
        value: `${createFullTimestamp(guild.createdAt)}`,
        inline: false,
      },
    );

    // Owner
    const owner = await guild.fetchOwner();
    if (owner?.user) {
      fields.push({
        name: interaction.getString("global.OWNER"),
        value: `${owner.user.tag} (${owner.user.id})`,
        inline: false,
      });
    }

    // Members
    fields.push({
      name: interaction.getString("global.MEMBERS"),
      value: guild.memberCount.toString(),
      inline: true,
    });

    // Channels
    if (guild.channels.cache.size > 0) {
      fields.push({
        name: interaction.getString("global.CHANNELS"),
        value: guild.channels.cache.size.toString(),
        inline: true,
      });
    }

    // Roles
    if (guild.roles.cache.size > 0) {
      fields.push({
        name: interaction.getString("global.ROLES"),
        value: guild.roles.cache.size.toString(),
        inline: true,
      });
    }

    // Emojis
    if (guild.emojis.cache.size > 0) {
      fields.push({
        name: interaction.getString("global.EMOJIS"),
        value: guild.emojis.cache.size.toString(),
        inline: true,
      });
    }

    // Stickers
    if (guild.stickers.cache.size > 0) {
      fields.push({
        name: interaction.getString("global.STICKERS"),
        value: guild.stickers.cache.size.toString(),
        inline: true,
      });
    }

    interaction.reply({
      embeds: [
        {
          color: this.bot.config.colours.primary,
          fields: fields,
          author: {
            name: guild.name,
            icon_url: guild.iconURL({ dynamic: true }) ?? undefined,
          },
          thumbnail: {
            url: guild.iconURL({ dynamic: true }) ?? undefined,
          },
          image: {
            url: guild.bannerURL({ size: 1024 }) ?? undefined,
          },
        },
      ],
    });
  }
}
