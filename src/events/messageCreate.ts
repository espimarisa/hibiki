/**
 * @file Event listener for messageCreate.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { Message } from "discord.js";

export const messageCreate: HibikiEvent<"messageCreate"> = {
  event: "messageCreate",
  once: false,

  // biome-ignore lint/suspicious/useAwait: <explanation>
  async runEvent(message: Message) {
    // Do not process bot messages
    if (!message.content || message.author.bot) {
      return;
    }

    return;
  },
};
