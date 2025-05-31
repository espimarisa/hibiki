/**
 * @file Chat command to check the current latency and shard status.
 * @license zlib
 */

import { SnowflakeUtil } from "discord.js";
import { HibikiColors } from "@/utils/constants.ts";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.ts";

export const pingCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Calculates the current ping and shard latency.
    const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
    const shard = interaction.guild ? interaction.guild.shardId : 0;
    const latency = interaction.client.ws.shards.get(shard)?.ping || 0;

    // Sends the reply.
    await interaction.reply({
      flags: ["Ephemeral"],
      embeds: [
        {
          color: HibikiColors.Primary,
          title: t("commands:ping.response.pong", { lng: interaction.locale }),
          description: t("commands:ping.response.result", {
            lng: interaction.locale,
            latency: latency,
            ping: ping,
            shard: shard,
          }),
        },
      ],
    });
  },

  data: () => {
    return {
      name: "ping",
      name_localizations: tAllN("commands:ping.name"),
      description: tD("commands:ping.description"),
      description_localizations: tAllD("commands:ping.description"),
    };
  },
};
