window.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("pinEmoji");
  const picker = new EmojiButton();

  picker.on("emoji", emoji => {
    document.getElementById("pinEmoji").innerHTML = emoji;
  });

  button.addEventListener("click", () => {
    picker.togglePicker(button);
  });
});
