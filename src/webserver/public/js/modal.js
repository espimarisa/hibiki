/**
 * @fileoverview Modal
 * @description Handles modal popouts in Bulma
 * @module webserver/public/modal
 */

"use strict";

// Gets the cancel button and listens for click
document.getElementById("cancel-button").addEventListener("click", toggleButton);

// Clicks the cancel button
function toggleButton() {
  document.getElementById("modal-close").click();
}

document.querySelectorAll(".modal-button").forEach((element) => {
  const target = document.querySelector(element.getAttribute("data-target"));
  const keyfunc = (key) => {
    if (key.key === "Escape") target.querySelector(".delete").click();
  };

  // Key functionality on modals
  document.addEventListener("keydown", keyfunc);
  element.addEventListener("click", () => {
    target.classList.add("is-active");
    target.querySelector(".delete").addEventListener("click", () => {
      target.classList.remove("is-active");
      document.removeEventListener("keydown", keyfunc);
    });
  });
});
