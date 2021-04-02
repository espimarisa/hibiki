/**
 * @fileoverview Navbar handler
 * @description Handles Bulma navbar functionality
 * @module webserver/public/navbar
 */

"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const burgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
  if (burgers.length > 0) {
    burgers.forEach((element) => {
      element.addEventListener("click", () => {
        // Gets target
        const target = element.dataset.target;
        const $target = document.getElementById(target);

        // Toggle is-active
        element.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});
