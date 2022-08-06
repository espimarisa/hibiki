/**
 * @file Message
 * @description Handles legacy message-based commands
 * @module HibikiMessageEvent
 */

import type { Message } from "discord.js";
import { HibikiEvent } from "../classes/Event.js";

export class HibikiMessageEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["messageCreate"];
  requiredIntents?: ResolvableIntentString[] = ["GUILD_MESSAGES"];

  public async run(_event: HibikiEventEmitter, msg: Message) {
    if (!msg?.content || !msg.author || msg.author.bot || !msg.channel || msg.channel.type === "") return;
    console.log(msg.content);
  }
}
