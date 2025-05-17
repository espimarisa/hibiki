/**
 * @file Event listener for messageReactionRemove.
 * @license zlib
 */

import {
  resolvePartialMessage,
  resolvePartialReaction,
  resolvePartialUser,
} from "@/helpers/discord.ts";
import { handleStarRemove } from "@/helpers/starboard.ts";
import type { Message, MessageReaction, User } from "discord.js";

export const messageReactionRemove: HibikiListener<"messageReactionRemove"> = {
  event: "messageReactionRemove",

  handle: async (reaction, user) => {
    let fetchedReaction: MessageReaction | undefined;
    let fetchedUser: User | undefined;
    let fetchedMessage: Message | undefined;

    // Fetches the reaction if it is a partial.
    if (reaction.partial) {
      fetchedReaction = await resolvePartialReaction(reaction);
    }

    // Fetches the message if it is a partial.
    if (reaction.message.partial) {
      fetchedMessage = await resolvePartialMessage(reaction.message);
    }

    // Fetches the user if it is a partial.
    if (user.partial) {
      fetchedUser = await resolvePartialUser(user);
    }

    // Runs the starboard handler if all partials resolve.
    if (fetchedMessage && fetchedReaction && fetchedUser) {
      await handleStarRemove(fetchedReaction, fetchedUser, fetchedMessage);
    }
  },
};
