const { colors } = require("../config");

module.exports = (title, description, type) => {
  let color = "";
  const construct = {
    embed: {
      footer: {},
    },
  };

  if (type) {
    // If an invalid color is given
    if (colors[type]) color = parseInt(colors[type].replace(/#/g, "0x"));
    else throw Error("Invalid color");
  } else {
    // Converts hexes
    color = parseInt(colors.general.replace(/#/g, "0x"));
  }

  if (title) construct.embed.title = title;
  if (description) construct.embed.description = description;

  construct.embed.color = color;
  construct.embed.addField = (name, text, icon) => addField(name, text, icon);
  return construct;
};

module.exports.color = (type) => {
  // Converts hex colors
  return parseInt(colors[type].replace(/#/g, "0x"));
};
