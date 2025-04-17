/**
 * @file Slash command to return current shard latency and status.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { AllInteractionContextTypes, HibikiColors } from "@/utils/constants.js";
import { t, tO } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder, SnowflakeUtil } from "discord.js";

export const pingCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setNameLocalizations(tO("commands:PING_NAME"))
    .setDescription(t("commands:PING_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:PING_DESCRIPTION"))
    .setContexts(AllInteractionContextTypes),

  async runCommand(interaction) {
    // Calculates the current ping and shard latency
    const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
    const shard = interaction.guild ? interaction.guild.shardId : 0;
    const latency = interaction.client.ws.shards.get(shard)?.ping || 0;

    // Sends the interaction
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(t("commands:PING_PONG"))
          .setDescription(
            t("commands:PING_LATENCY", {
              lng: interaction.locale,
              ping: ping,
              latency: latency,
            }),
          )
          .setColor(HibikiColors.Primary),
      ],
    });
  },
};
