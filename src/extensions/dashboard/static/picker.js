/*
  Emoji picker functionality
*/

// Gets pinEmoji ID; makes button
window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("pinEmoji");
  const picker = new EmojiButton();

  // Sets content
  picker.on("emoji", emoji => {
    document.getElementById("pinEmoji").innerHTML = emoji;
  });

  // Toggles picker
  button.addEventListener("click", () => {
    picker.togglePicker(button);
  });
});
