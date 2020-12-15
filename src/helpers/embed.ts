/**
 * @file Embed
 * @description Functions to create and edit oneliner embeds
 * @module helpers/embed
 */

import { Message } from "eris";
import config from "../../config.json";

/** Creates a new oneliner embed */
export async function createEmbed(title: string, desc: string | null, msg: Message, colortype?: string) {
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

/** Edits a oneliner embed */
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

/** Converts a hex color in the config to decimal */
export function convertHex(colortype: string): number {
  return parseInt(config.colors[colortype].replace(/#/g, "0x"));
}
