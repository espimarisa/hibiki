/**
 * @file Event listener for messageCreate.
 * @license zlib
 */

export const messageCreate = {
  event: "messageCreate",

  // biome-ignore lint/suspicious/useAwait: grr.
  handle: async (message) => {
    // Do not process invalid message data.
    if (!message.id || message.content.length === 0) {
      return;
    }

    // Do not process bot messages.
    if (message.author.id === message.client.user.id || message.author.bot) {
      return;
    }
  },
} satisfies HibikiListener<"messageCreate">;
