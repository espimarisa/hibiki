/*
  Navbar Functionality
  Handles Bulma's Navbar burger menus.
*/

document.addEventListener("DOMContentLoaded", () => {
  // Get all "navbar-burger" elements
  const $navbarBurgers = Array.prototype.slice.call(document.querySelectorAll(".navbar-burger"), 0);
  // Checks for any navbar burgers
  if ($navbarBurgers.length > 0) {
    // Add click event
    $navbarBurgers.forEach(el => {
      el.addEventListener("click", () => {
        // Get the target
        let target = el.dataset.target;
        let $target = document.getElementById(target);
        // Toggle is-active
        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});
