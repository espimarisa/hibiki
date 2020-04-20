/*
  Static Bio Updater
  Grabs the user's bio from input.
*/

let lastInput = new Date().getTime();
let lastText = "";

window.addEventListener("load", async () => {
  // Sets bio txt
  let res = await fetch("/api/getBio", { credentials: "include" });
  let bio = await res.text();
  if (bio && res.status === 200) {
    lastText = bio;
    document.getElementById("bio").value = bio;
  }

  // Input time
  document.getElementById("bio").addEventListener("input", () => {
    lastInput = new Date().getTime();
  });

  // Updates bio after 500ms
  setInterval(async () => {
    if (new Date().getTime() - lastInput > 500 && document.getElementById("bio").value !== lastText) {
      fetch(`/api/updateBio?bio=${encodeURIComponent(document.getElementById("bio").value)}`, { credentials: "include" });
      lastText = document.getElementById("bio").value;
    }
  }, 100);
});
