/**
 * @file Embed
 * @description Functions to create and edit oneliner embeds
 * @module helpers/embed
 */

import type { Message } from "eris";
import config from "../../config.json";

// Creates a new oneliner embed
export async function createEmbed(this: Message, title: string, desc?: string, colortype?: string) {
  if (this && !this.channel) return;
  let embedTitle;
  let embedDescription;
  let embedFieldColor;

  const embedFooter = {
    text: "",
    icon_url: "",
  };

  if (title) embedTitle = title.length > 256 ? `${title.substring(0, 256)}...` : title;
  if (desc) embedDescription = desc.length > 2048 ? `${desc.substring(0, 2048)}...` : desc;

  if (typeof this === "object" && this.author) {
    embedFooter.text = `Ran by ${this.author.username}#${this.author.discriminator}`;
    embedFooter.icon_url = this.author.dynamicAvatarURL();
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
    },
  };

  return this.channel.createMessage(embedConstruct);
}

// Edits a oneliner embed
export async function editEmbed(this: Message, title: string, desc?: string, colortype?: string) {
  if (!this) throw new Error("No message object was provided");
  if (this && !this.channel) return;
  let embedTitle;
  let embedDescription;
  let embedFooter;
  let embedFieldColor;

  if (title) embedTitle = title.length > 256 ? `${title.substring(0, 256)}...` : title;
  if (desc) embedDescription = desc.length > 2048 ? `${desc.substring(0, 2048)}...` : desc;

  if (colortype) {
    embedFieldColor = convertHex(colortype);
  } else {
    embedFieldColor = convertHex("general");
  }

  if (this && this.embeds[0].footer) {
    embedFooter = this.embeds[0].footer;
  }

  const embedConstruct = {
    embed: {
      title: embedTitle,
      description: embedDescription,
      color: embedFieldColor,
      footer: embedFooter,
    },
  };

  return this.edit(embedConstruct);
}

// Converts a hex color in the config
export function convertHex(colortype: string) {
  return parseInt(config.colors[colortype].replace(/#/g, "0x"));
}
