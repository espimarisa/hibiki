import type { Message } from "discord.js";
import { HibikiEvent } from "../classes/Event";

export class HibikiMessageEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["message"];
  requiredIntents?: ResolvableIntentString[] = ["GUILD_MESSAGES"];

  public async run(_event: HibikiEventEmitter, msg: Message) {
    if (!msg?.content || msg.author?.bot === true) return;
    console.log(msg.content);
  }
}
