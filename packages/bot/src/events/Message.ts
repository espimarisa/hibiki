import { HibikiEvent } from "../classes/Event.js";
import { Message } from "discord.js";

export class HibikiMessageEvent extends HibikiEvent {
  events: HibikiEventListener[] = ["messageCreate"];

  // eslint-disable-next-line @typescript-eslint/require-await
  public async run(_event: HibikiEventListener[], msg: Message) {
    if (!msg.content || msg.author.bot) return;
  }
}
