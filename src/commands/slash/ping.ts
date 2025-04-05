/**
 * @file Slash command to return current shard latency and status.
 * @author Espi Marisa <contact@espi.me>
 * @module commands/slash/ping
 */

import { HibikiColors } from "@/utils/constants.js";
import { t, tMap } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder, SnowflakeUtil } from "discord.js";

export const testCommand: HibikiSlashCommand = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setNameLocalizations(tMap("command:PING_NAME"))
    .setDescription(t("command:PING_DESCRIPTION"))
    .setDescriptionLocalizations(tMap("command:PING_DESCRIPTION")),

  async runCommand(interaction) {
    // Calculates the current ping and shard latency
    const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
    const shard = interaction.guild?.shardId || 0;
    const latency = interaction.client.ws.shards.get(shard)?.ping || 0;

    // Creates the embed
    const embed = new EmbedBuilder()
      .setTitle(t("command:PING_PONG"))
      .setDescription(
        t("command:PING_LATENCY", {
          lng: interaction.locale,
          ping: ping,
          latency: latency,
        }),
      )
      .setColor(HibikiColors.Primary);

    // Sends the interaction
    await interaction.reply({ embeds: [embed] });
  },
};
