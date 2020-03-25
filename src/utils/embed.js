/*
  Verniy Embed Generator
  © 2020 smolespi & resolved
  github.com/smolespi/Verniy
*/

const { colours } = require("../cfg");

module.exports = (title, description, type) => {
  let color = "";
  let construct = {
    embed: {
      footer: {},
    },
  };

  if (type !== undefined) {
    // If an invalid colour is given
    if (colours[type] != undefined) color = parseInt(colours[type].replace(/#/g, "0x"));
    else throw Error("Invalid colour");
  } else {
    // Converts hexes
    color = parseInt(colours.general.replace(/#/g, "0x"));
  }

  // Sets the description; fallback to none
  if (!description || description != undefined) {
    construct.embed.description = description;
  }

  // Sets the title; fallback to none
  if (!title || title != undefined) {
    construct.embed.title = title;
  }

  // Sets the embed colour
  construct.embed.color = color;
  construct.embed.addField = (name, text, icon) => addField(name, text, icon);

  return construct;
};
