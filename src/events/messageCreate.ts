/**
 * @file Event listener for messageCreate.
 * @license Zlib
 */

import type { HibikiEvent } from "@/helpers/event.ts";

export const messageCreate: HibikiEvent<"messageCreate"> = {
  event: "messageCreate",

  // biome-ignore lint/suspicious/useAwait: grr.
  async handle(message) {
    // Do not process invalid message data.
    if (!message.id || message.content.length === 0) {
      return;
    }

    // Do not process bot messages.
    if (message.author.id === message.client.user.id || message.author.bot) {
      return;
    }

    return;
  },
};
