/**
 * @file Event listener for messageCreate.
 * @license Zlib
 */

import type { HibikiEvent } from "@/helpers/event.ts";

export const messageCreate: HibikiEvent<"messageCreate"> = {
  event: "messageCreate",

  // biome-ignore lint/suspicious/useAwait: grr.
  async handle(msg) {
    // Do not process invalid message data.
    if (!msg.id || msg.content.length === 0) {
      return;
    }

    // Do not process bot messages.
    if (msg.author.id === msg.client.user.id || msg.author.bot) {
      return;
    }

    return;
  },
};
