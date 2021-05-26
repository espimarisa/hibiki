/**
 * @file Embed
 * @description Functions to create and edit oneliner embeds
 * @module utils/embed
 */

import { AnyChannel, Message, TextChannel } from "eris";
import config from "../../config.json";

// Creates a new oneliner embed
export async function createEmbed(this: Message | AnyChannel, title: string, desc?: string, colortype?: keyof typeof config.colors) {
  if (this && ((this instanceof Message && !this.channel) || ![0, 5].includes(this.type))) return;
  let embedTitle;
  let embedDescription;
  let embedFieldColor;

  const embedFooter = {
    text: "",
    icon_url: "",
  };

  if (title) embedTitle = title.length > 250 ? `${title.substring(0, 250)}...` : title;
  if (desc) embedDescription = desc.length > 2000 ? `${desc.substring(0, 2000)}...` : desc;

  if (typeof this === "object" && this instanceof Message && this.author) {
    embedFooter.text = `${this.string("global.RAN_BY", { author: this.tagUser(this.author) })}`;
    embedFooter.icon_url = this.author.dynamicAvatarURL();
  }

  if (colortype) embedFieldColor = convertHex(colortype);
  else embedFieldColor = convertHex("general");

  const embedConstruct = {
    embed: {
      title: embedTitle,
      description: embedDescription,
      color: embedFieldColor,
      footer: embedFooter,
    },
  };

  return (this instanceof Message ? this.channel : (this as TextChannel)).createMessage(embedConstruct);
}

// Edits a oneliner embed
export async function editEmbed(this: Message, title: string, desc?: string, colortype?: keyof typeof config.colors) {
  if (!this) throw new Error("No message object was provided");
  if (this && !this.channel) return;
  let embedTitle;
  let embedDescription;
  let embedFooter;
  let embedFieldColor;

  if (title) embedTitle = title.length > 250 ? `${title.substring(0, 250)}...` : title;
  if (desc) embedDescription = desc.length > 2000 ? `${desc.substring(0, 2000)}...` : desc;
  if (colortype) embedFieldColor = convertHex(colortype);
  else embedFieldColor = convertHex("general");

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
export function convertHex(colortype: keyof typeof config.colors) {
  return parseInt(config.colors[colortype].replace(/#/g, "0x"));
}
