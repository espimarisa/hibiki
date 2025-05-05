/**
 * @file Event listener for messageReactionAdd.
 * @license Zlib
 */

import { getGuildConfig } from "@/db/services/guildConfig.ts";
import type { HibikiEvent } from "@/helpers/event.ts";
import { DEFAULT_STAR_THRESHOLD, STAR_EMOJI } from "@/helpers/starboard.ts";

export const messageReactionAdd = {
  event: "messageReactionAdd",

  async handle(reaction, user) {
    // Ensures we get the full reaction object first.
    if (reaction.partial) {
      await reaction.fetch().catch(() => {
        return;
      });
    }

    // Do not handle reactions with zero (weird edge case).
    if (!reaction?.count) {
      return;
    }

    // Gets the full message reaction object.
    if (reaction.message.partial) {
      await reaction.message.fetch().catch(() => {
        return;
      });
    }

    // Do not handle reactions without a star emoji, by bots, or ourselves.
    if (reaction.emoji.name !== STAR_EMOJI || user.bot || reaction.me) {
      return;
    }

    // Ignores reactions in DMs.
    if (!reaction.message.guild) {
      return;
    }

    // Checks to see if the guild has a starboard_channel set.
    const config = await getGuildConfig(reaction.message.guild.id);
    if (!config?.starboard_channel) {
      return;
    }

    // Ignores reactions inside of the starboard channel.
    if (reaction.message.channel.id === config.starboard_channel) {
      return;
    }

    // Ignores self-stars.
    if (reaction.message.author?.id === user.id) {
      return;
    }

    // Gets the threshold we should use.
    const STAR_THRESHOLD = config.starboard_count ?? DEFAULT_STAR_THRESHOLD;
    if (reaction.count < STAR_THRESHOLD) {
      return;
    }
  },
} satisfies HibikiEvent<"messageReactionAdd">;
