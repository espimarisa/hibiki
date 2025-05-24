/**
 * @file Chat command to check the current latency and shard status.
 * @license Zlib
 */

import { HibikiColors } from "@/utils/constants.js";
import { t, tAllD, tAllN, tD } from "@/utils/i18n.js";
import { InteractionContextType, SnowflakeUtil } from "discord.js";

export const pingCommand: HibikiChatCommand = {
  run: async (interaction) => {
    // Calculates the current ping and shard latency.
    const ping = Date.now() - SnowflakeUtil.timestampFrom(interaction.id);
    const shard = interaction.guild ? interaction.guild.shardId : 0;
    const latency = interaction.client.ws.shards.get(shard)?.ping || 0;

    // Sends the reply.
    await interaction.reply({
      embeds: [
        {
          color: HibikiColors.Primary,
          title: t("commands:ping.pong", { lng: interaction.locale }),
          description: t("commands:ping.response", {
            lng: interaction.locale,
            latency: latency,
            ping: ping,
            shard: shard,
          }),
        },
      ],
    });
  },

  setData: () => {
    return {
      name: "ping",
      description: tD("commands:ping.description"),
      name_localizations: tAllN("commands:ping.name"),
      description_localizations: tAllD("commands:ping.description"),
      contexts: [InteractionContextType.Guild],
    };
  },
};
