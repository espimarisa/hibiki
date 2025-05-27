/**
 * @file Error localization data.
 * @license CC-BY-SA-4.0
 */

export const errors = {
  fetch: {
    failed: "Failed to fetch information. Try again later.",
    image: "Unable to get image response data. Try again later.",
  },

  general: {
    error: "Error",
    spottedABug: "Spotted a bug? - github.com/espimarisa/hibiki",
    errorStack: "\n```ts\n{{- error}}\n```",
    errorWithEmoji: "❌ Error",
  },

  option: {
    missing: {
      option: "No **{{option}}** was provided.",
    },

    invalid: {
      channel: "**{{option}}** is not a valid channel.",
      member: "**{{option}}** is not a valid member.",
      role: "**{{option}}** is not a valid role.",
      textChannel: "**{{option}}** is not a valid text channel.",
      user: "**{{option}}** is not a valid user.",
      voiceChannel: "**{{option}}** is not a valid voice channel.",
    },
  },
};
