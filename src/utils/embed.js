/**
 * @fileoverview Embed generator
 * @description Creates an embed using this.bot.embed();
 */

const { colors } = require("root/config");

module.exports = (title, description, type) => {
  let color = "";
  const construct = {
    embed: {
      footer: {},
    },
  };

  if (type) {
    // Converts hex colors
    if (colors[type]) color = parseInt(colors[type].replace(/#/g, "0x"));
    else throw Error("Invalid color - check the embed construct.");
  } else {
    color = parseInt(colors.general.replace(/#/g, "0x"));
  }

  // Sets the construct
  if (title) construct.embed.title = title;
  if (description) construct.embed.description = description;
  construct.embed.color = color;
  construct.embed.addField = (name, text, icon) => addField(name, text, icon);
  return construct;
};

// Embed colors
module.exports.color = type => {
  return parseInt(colors[type].replace(/#/g, "0x"));
};
