/**
 * @file Event listener for messageCreate.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { Message } from "discord.js";

export const messageCreate: HibikiListener<"messageCreate"> = {
  event: "messageCreate",
  once: false,

  // biome-ignore lint/suspicious/useAwait: <explanation>
  async runListener(msg: Message) {
    // Do not process invalid message data
    if (!msg.id || msg.content.length === 0) {
      return;
    }

    // Do not process bot messages
    if (msg.author.id === msg.client.user.id || msg.author.bot) {
      return;
    }

    return;
  },
};
