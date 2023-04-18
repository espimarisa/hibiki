/**
 * @file Message
 * @description Handles legacy message-based commands
 * @module HibikiMessageEvent
 */

import { HibikiEvent } from "../classes/Event.js";
import { Message } from "@projectdysnomia/dysnomia";

export class HibikiMessageEvent extends HibikiEvent {
  events: HibikiEventListener[] = ["messageCreate"];

  public async run(_event: HibikiEventListener[], msg: Message) {
    if (!msg?.content || !msg.author || msg.author.bot || !msg.channel) return;
  }
}
