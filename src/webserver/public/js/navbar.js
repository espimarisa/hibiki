"use strict";

/**
 * @fileoverview Navbar handler
 * @description Handles Bulma navbar functionality
 * @module webserver/navbar
 */

document.addEventListener("DOMContentLoaded", () => {
  // Get elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
  if ($navbarBurgers.length > 0) {
    // Add click event
    $navbarBurgers.forEach(el => {
      el.addEventListener("click", () => {
        // Gets target
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        // Toggle is-active
        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});
