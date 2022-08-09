/**
 * @file Message
 * @description Handles legacy message-based commands
 * @module HibikiMessageEvent
 */

import { HibikiEvent } from "../classes/Event.js";
import { ChannelType, Message } from "discord.js";

export class HibikiMessageEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["messageCreate"];
  requiredIntents?: ResolvableIntentString[] = ["GuildMessages"];

  public async run(_event: HibikiEventEmitter, msg: Message) {
    if (!msg?.content || !msg.author || msg.author.bot || !msg.channel || msg.channel.type !== ChannelType.GuildText) return;
    console.log(msg.content);
  }
}
