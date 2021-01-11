window.addEventListener("load", () => {
  document.getElementById("stare").addEventListener("click", () => {
    let el = document.getElementById("stare");
    let splitSrc = el.src.split("/");
    switch(splitSrc[splitSrc.length - 1]) {
      case "stare.png":
        el.src = "/public/img/stare2.png"
      break;
      case "stare2.png":
        el.src = "/public/img/stare3.png"
      break;
      case "stare3.png":
        el.src = "/public/img/stare.png"
      break;
    }
  })
});