/*
  This generates an embed. "title", "desc", "colourtype".
*/

const { colours } = require("../cfg");

module.exports = (title, description, type) => {
  let color = "";
  const construct = {
    embed: {
      footer: {},
    },
  };

  if (type) {
    // If an invalid colour is given
    if (colours[type]) color = parseInt(colours[type].replace(/#/g, "0x"));
    else throw Error("Invalid colour");
  } else {
    // Converts hexes
    color = parseInt(colours.general.replace(/#/g, "0x"));
  }

  // Sets the title & description
  if (title) construct.embed.title = title;
  if (description) construct.embed.description = description;

  // Sets the embed colour
  construct.embed.color = color;
  construct.embed.addField = (name, text, icon) => addField(name, text, icon);
  return construct;
};

module.exports.colour = (type) => {
  // Converts hex colours
  return parseInt(colours[type].replace(/#/g, "0x"));
};
