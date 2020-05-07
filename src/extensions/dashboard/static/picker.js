/*
  Emoji picker functionality
*/

// Gets pinEmoji ID; makes button
window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("pinEmoji");
  const picker = new EmojiButton({
    emojiSize: "1.5em",
    showRecents: false,
    showPreview: false,
    showVariants: false,
    theme: "dark",
    position: "right",
    categories: ["smileys", "animals", "food", "activities", "travel", "objects", "symbols"],
  });

  // Sets content
  picker.on("emoji", emoji => {
    document.getElementById("pinEmoji").innerHTML = emoji;
  });

  // Toggles picker
  button.addEventListener("click", () => {
    picker.togglePicker(button);
  });
});
