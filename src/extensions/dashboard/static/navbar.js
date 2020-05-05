/*
  This handles bulma's mobile navbar opening.
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
        const target = el.dataset.target;
        const $target = document.getElementById(target);
        // Toggle is-active
        el.classList.toggle("is-active");
        $target.classList.toggle("is-active");
      });
    });
  }
});
