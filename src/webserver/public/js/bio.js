/**
 * @fileoverview Bio grabber
 * @description Grabs a bio from user input
 * @module webserver/bio
 */

let lastInput = new Date().getTime();
let bio;

window.addEventListener("load", async () => {
  // Gets the csrf token
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

  // Gets the bio
  const body = await fetch("/api/getBio", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => res.text().catch(() => {}));

  // Sets content if there's a bio
  if (body && body !== '{"error":"404"}') {
    document.getElementById("bio").value = body;
    // Empties content if there's not a bio
  } else if (!body || body === '{"error":"404"}') {
    document.getElementById("bio").value = "";
  }

  // Input timer
  document.getElementById("bio").addEventListener("input", () => {
    lastInput = new Date().getTime();
  });

  // Updates bio after 500ms
  setInterval(async () => {
    if (new Date().getTime() - lastInput > 500 && document.getElementById("bio").value !== bio) {
      fetch(`/api/updateBio?bio=${encodeURIComponent(document.getElementById("bio").value)}`, {
        credentials: "include",
        headers: {
          "CSRF-Token": token,
        },
      });

      bio = document.getElementById("bio").value;
    }
  }, 100);
});
