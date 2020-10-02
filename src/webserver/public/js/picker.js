"use strict";

/**
 * @fileoverview Emoji picker
 * @description Handles the emoji picker on the frontend
 * @module webserver/picker
 */

import { EmojiButton } from "https://cdn.jsdelivr.net/npm/@joeattardi/emoji-button/dist/index.min.js";

// Gets pinEmoji ID; makes button
window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("pinEmoji");
  const picker = new EmojiButton({
    emojiSize: "1.5em",
    showRecents: false,
    showPreview: false,
    showVariants: false,
    theme: "auto",
    categories: ["smileys", "animals", "food", "activities", "travel", "objects", "symbols"],
    position: {
      top: "0",
      right: "0",
    },
  });

  // Sets content
  picker.on("emoji", selection => {
    document.getElementById("pinEmoji").innerHTML = selection.emoji;
  });

  // Toggles picker
  button.addEventListener("click", () => {
    picker.togglePicker(button);
  });
});
