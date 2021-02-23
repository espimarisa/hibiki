/**
 * @fileoverview Modal
 * @description Handles modal popouts in Bulma
 * @module webserver/public/modal
 */

"use strict";

// Modal functionality

// Cancel button support
document.getElementById("cancel-button").addEventListener("click", toggleButton);

function toggleButton() {
  document.querySelector("#modal > div.modal-card > header > button").click();
}

document.querySelectorAll(".modal-button").forEach(function (el) {
  const target = document.querySelector(el.getAttribute("data-target"));
  const keyfunc = (key) => {
    if (key.key === "Escape") target.querySelector(".delete").click();
    // if (key.key === "Enter") target.querySelector("#delete").click();
  };

  // Key functionality on modals
  document.addEventListener("keydown", keyfunc);
  el.addEventListener("click", function () {
    target.classList.add("is-active");
    target.querySelector(".delete").addEventListener("click", function () {
      target.classList.remove("is-active");
      document.removeEventListener("keydown", keyfunc);
    });
  });
});
