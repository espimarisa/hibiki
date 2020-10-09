/**
 * @fileoverview Embed
 * @descriptions Function to generate embeds
 * @module embed
 */

const { colors } = require("../../config");
const format = require("./format");

/**
 * Creates an embed
 * @param {string} title The title of the embed
 * @param {string} description The description of the embed, set to null to clear
 * @param {object} msg Message object for setting the footer & sending the embed
 * @param {string} [colortype] Type of color (set in the config file)
 *
 * The color is automatically set to "general" if you don't specify it.
 * Otherise, you can set it to "error", "success", or "pinboard", or any other colors you add in config.json.
 * @example this.bot.embed("title", "description", msg, "colortype");
 */

module.exports = (title, description, msg, colortype) => {
  let color = "";
  const construct = {
    embed: {
      footer: {},
    },
  };

  // Sets title & description
  if (title) construct.embed.title = title;
  if (description) construct.embed.description = description;

  // Author footer
  if (typeof msg === "object" && msg.author) {
    construct.embed.author = {};
    construct.embed.footer.text = `Ran by ${format.tag(msg.author)}`;
    construct.embed.footer.icon_url = msg.author.dynamicAvatarURL();
  }

  // Embed color
  if (colortype) {
    if (!colortype && author) color = parseInt(colors[msg.author].replace(/#/g, "0x"));
    else if (colors[colortype]) color = parseInt(colors[colortype].replace(/#/g, "0x"));
    else throw Error("Invalid color - check the embed construct.");
  } else {
    color = parseInt(colors.general.replace(/#/g, "0x"));
  }

  construct.embed.color = color;
  if (!msg || msg && !msg.channel) throw new Error("No message object to send, contact a developer!");
  else if (msg && msg.channel) return msg.channel.createMessage(construct).catch(() => {});
};

/**
 * Edits an embed
 * @param {string} title The title of the embed
 * @param {string} description The description of the embed, set to null to clear
 * @param {object} msg The message object to update
 * @param {string} colortype Type of color (set in the config file)
 *
 * @example
 * // The first message must be asynchronous to work properly
 * const message = await this.bot.embed("Title", "Description", msg);
 * // Be sure you use the message object of the one you want to edit
 * this.bot.embed.edit("Edited Title", "Edited Description", message);
 */

module.exports.edit = (title, description, msg, colortype) => {
  let color = "";
  const construct = {
    embed: {
      footer: {},
    },
  };

  // Sets title & description
  if (title) construct.embed.title = title;
  if (description) construct.embed.description = description;

  // Keeps the footer
  if (msg && msg.embeds[0].footer) {
    construct.embed.footer = msg.embeds[0].footer;
  }

  // Embed color
  if (colortype) {
    if (!colortype && msg) color = parseInt(colors[msg.author].replace(/#/g, "0x"));
    else if (colors[colortype]) color = parseInt(colors[colortype].replace(/#/g, "0x"));
    else throw Error("Invalid color - check the embed construct.");
  } else {
    color = parseInt(colors.general.replace(/#/g, "0x"));
  }

  construct.embed.color = color;
  if (msg) return msg.edit(construct);
};

/**
 * Exports this.bot.embed.color() for use in embed objects
 *
 * @example
 * msg.channel.createMessage({
 *   embed: {
 *    title: "title",
 *    color: this.bot.embed.color("colortype");
 *   }
 * });
 *
 * @param {string} colortype The type of color to parse (set in the config file)
 */

module.exports.color = colortype => {
  return parseInt(colors[colortype].replace(/#/g, "0x"));
};
