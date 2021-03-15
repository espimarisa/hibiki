/**
 * @file Imageclick Cycler
 * @description Cycles through images on click
 * @module webserver/public/imageClick
 */

"use strict";

window.addEventListener("load", () => {
  document.getElementById("stare").addEventListener("click", () => {
    const el = document.getElementById("stare");
    const splitSrc = el.src.split("/");
    switch (splitSrc[splitSrc.length - 1]) {
      case "stare.png":
        el.src = "/public/img/stare2.png";
        break;
      case "stare2.png":
        el.src = "/public/img/stare3.png";
        break;
      case "stare3.png":
        el.src = "/public/img/stare.png";
        break;
    }
  });
});

// Toggles image visibility
document.addEventListener("scroll", () => {
  const header = document.getElementById("stare");
  const menu = document.querySelector("div.menu.sticky");
  const rect = menu.getBoundingClientRect();

  if (rect.y > 40) {
    header.style.position = "absolute";
    header.style.top = `${window.innerHeight}px`;
    header.style.height = "auto";
  } else {
    // note to other people that aren't as stupid as me:
    // no touchey this code breaks rlly randomly
    header.style.bottom = "0px";
    header.style.top = "0%";
    header.style.position = "sticky";
  }
});
