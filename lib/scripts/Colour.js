/*
  Verniy Colour Generator
  © 2020 smolespi & resolved
  github.com/smolespi/Verniy
*/

const { colours } = require("../../cfg");

module.exports = type => {
  let color;
  // Converts hex to decimal
  if (type !== undefined) {
    if (colours[type] != undefined) color = parseInt(colours[type].replace(/#/g, "0x"));
    // If an invalid colour is given
    else throw Error("Invalid colour");
  } else {
    color = parseInt(colours.embed.general.replace(/#/g, "0x"));
  }
  return color;
};
