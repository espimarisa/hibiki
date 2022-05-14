/**
 * @file MessageUpdateLogger
 * @description Logs when messages are updated, deleted, or deleted in bulk
 * @module HibikiMessageUpdateLogger
 */

import type { Message } from "discord.js";
import { HibikiEvent } from "../classes/Event.js";

export class HibikiMessageUpdateLogger extends HibikiEvent {
  events: HibikiEventEmitter[] = ["messageUpdate", "messageDelete", "messageDeleteBulk"];

  public async run(event: HibikiEventEmitter, oldmsg: Message, newmsg: Message) {
    if (!oldmsg) return;

    switch (event) {
      case "messageUpdate": {
        if (!newmsg) return;
        console.log("a message was updated");
        break;
      }

      case "messageDelete": {
        console.log("messages were deleted");
        break;
      }

      case "messageDeleteBulk": {
        console.log("messages were deleted in bulk");
        break;
      }
    }
  }
}
