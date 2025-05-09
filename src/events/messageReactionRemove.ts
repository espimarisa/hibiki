/**
 * @file Event listener for messageReactionRemove.
 * @license Zlib
 */

import type { HibikiEvent } from "@/helpers/event.ts";
import { handleStarRemove } from "@/helpers/starboard.ts";
import { captureError, parseError } from "@/utils/error.ts";
import { clientLog } from "@/utils/logger.ts";
import type { MessageReaction, User } from "discord.js";

export const messageReactionRemove = {
  event: "messageReactionRemove",

  async handle(reaction, user) {
    let fetchedReaction = reaction as MessageReaction;
    let fetchedUser = user as User;

    // Fetches the reaction if it is a partial.
    if (reaction.partial) {
      try {
        fetchedReaction = await reaction.fetch();
      } catch (err) {
        const error = parseError(err);
        clientLog.error(`Failed to fetch partial reaction: ${error.message}`);
        return;
      }
    }

    // Fetches the message if it is a partial.
    if (reaction.message.partial) {
      try {
        await reaction.message.fetch();
      } catch (err) {
        const error = parseError(err);
        clientLog.error(
          `Failed to fetch partial message ${reaction.message.id}: ${error.message}`,
        );

        return;
      }
    }

    // Fetches the user if it is a partial.
    if (user.partial) {
      try {
        fetchedUser = await user.fetch();
      } catch (err) {
        const error = parseError(err);
        clientLog.error(
          `Failed to fetch partial user ${user.id}: ${error.message}`,
        );

        return;
      }
    }

    try {
      // Runs the starboard handler.
      await handleStarRemove(fetchedReaction, fetchedUser);
    } catch (err) {
      const error = parseError(err);
      clientLog.error(`Error handling event ${this.event}: ${error.message}`);
      captureError(error, { messageID: reaction.message.id, userID: user.id });
    }
  },
} satisfies HibikiEvent<"messageReactionRemove">;
