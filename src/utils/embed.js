/*
  This generates a basic & clean embed for simpler code.
  It also converts colours in cfg.json to work in Node.
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

  // Sets the title; fallback to none
  if (!title || title != undefined) construct.embed.title = title;
  // Sets the description; fallback to none
  if (!description || description != undefined) construct.embed.description = description;

  // Sets the embed colour
  construct.embed.color = color;
  construct.embed.addField = (name, text, icon) => addField(name, text, icon);
  return construct;
};

module.exports.colour = (type) => {
  // Converts hex colours
  return parseInt(colours[type].replace(/#/g, "0x"));
}
