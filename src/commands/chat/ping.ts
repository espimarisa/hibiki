/**
 * @file Chat command to check the current latency and shard status.
 * @license Zlib
 */

import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllDescriptions, tAllNames, tDescription } from "@/utils/i18n.ts";
import { EmbedBuilder, SlashCommandBuilder, SnowflakeUtil } from "discord.js";

const commandData = new SlashCommandBuilder()
  .setName("ping")
  .setNameLocalizations(tAllNames("commands:ping.name"))
  .setDescription(tDescription("commands:ping.description"))
  .setDescriptionLocalizations(tAllDescriptions("commands:ping.description"));

export const pingCommand = {
  data: commandData,

  run: async (interaction) => {
    // Calculates the current ping and shard latency.
    const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
    const shard = interaction.guild ? interaction.guild.shardId : 0;
    const latency = interaction.client.ws.shards.get(shard)?.ping || 0;

    // Sends the interaction.
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t("commands:ping.pong", { lng: interaction.locale }))
          .setDescription(
            t("commands:ping.response", {
              lng: interaction.locale,
              latency: latency,
              ping: ping,
              shard: shard,
            }),
          )
          .setColor(HibikiColors.Primary),
      ],
    });
  },
} satisfies HibikiChatCommand;
