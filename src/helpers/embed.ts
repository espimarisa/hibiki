/**
 * @file Embed
 * @description Functions to create and edit oneliner embeds
 * @module helpers/embed
 */

import { Message } from "eris";
import config from "../../config.json";

/**
 * Creates a new simple oneliner embed
 * @param {string} title The title field of the embed
 * @param {string} desc The description field of the embed. Set to null if you want it to be empty
 * @param {Message} msg The message object to use, usually just msg
 * @param {string} colortype The type of color to use. If not given, will use "generaL". View colors portion of config.json
 *
 * @await
 * @example createEmbed("Embed Title", "Embed Description", msg, "error")
 */

export async function createEmbed(title: string, desc: string | null, msg: Message, colortype?: string): Promise<unknown> {
  if (!msg) throw new Error("No message object was provided");
  if (msg && !msg.channel) return;
  let embedTitle;
  let embedDescription;
  let embedFieldColor;

  const embedFooter = {
    text: "",
    icon_url: "",
  };

  if (title) embedTitle = title;
  if (desc) embedDescription = desc;

  if (typeof msg === "object" && msg.author) {
    embedFooter.text = `Ran by ${msg.author.username}#${msg.author.discriminator}`;
    embedFooter.icon_url = msg.author.dynamicAvatarURL();
  }

  if (colortype) {
    embedFieldColor = convertHex(colortype);
  } else {
    embedFieldColor = convertHex("general");
  }

  const embedConstruct = {
    embed: {
      title: embedTitle,
      description: embedDescription,
      color: embedFieldColor,
      footer: embedFooter,
      timestamp: new Date(),
    },
  };

  // TODO: Log any issues here with a *proper* logger so we can actually figure out problems!
  return msg.channel.createMessage(embedConstruct);
}

/**
 * Edits a simple oneliner embed
 * @param {string} title The title field of the embed
 * @param {string} desc The description field of the embed. Set to null if you want it to be empty
 * @param {Message} msg The message object to use. Use the msg object you defined earlier!
 * @param {string} colortype The type of color to use. If not given, will use "generaL". View colors portion of config.json
 *
 * @await
 * @example const msgtoedit = (await createEmbed("Embed Title", "Embed Description", msg, "error")) as Message;
 * await editEmbed("Edited Title", "Edited Description", msgtoedit, "success")
 */

export async function editEmbed(title: string, desc: string | null, msg: Message, colortype?: string): Promise<unknown> {
  if (!msg) throw new Error("No message object was provided");
  if (msg && !msg.channel) return;
  let embedTitle;
  let embedDescription;
  let embedFooter;
  let embedFieldColor;

  if (title) embedTitle = title;
  if (desc) embedDescription = desc;

  if (colortype) {
    embedFieldColor = convertHex(colortype);
  } else {
    embedFieldColor = convertHex("general");
  }

  // TODO: handle exceptions properly
  if (msg && msg.embeds[0].footer) {
    embedFooter = msg.embeds[0].footer;
  }

  const embedConstruct = {
    embed: {
      title: embedTitle,
      description: embedDescription,
      color: embedFieldColor,
      footer: embedFooter,
      timestamp: new Date(),
    },
  };

  return msg.edit(embedConstruct);
}

/**
 * Converts a hex color to hexadecimal since Discord's API sucks
 * @param {string} colortype The color in the config to convert.
 *
 * @example color: bot.convertHex("general"),
 */

export function convertHex(colortype: string): number {
  return parseInt(config.colors[colortype].replace(/#/g, "0x"));
}
