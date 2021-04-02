/**
 * @fileoverview waitFor
 * @description Waits for an event to happen and acts on it
 * @module utils/waitFor
 */

import type { Message } from "eris";
import type { HibikiClient } from "../classes/Client";
import type { LocaleString } from "../typings/locales";
import { convertHex } from "./embed";

// Waits for an event to happen and rejects or resolves it
export function waitFor(event: string, timeout: number, check: any, bot: HibikiClient) {
  let t: NodeJS.Timeout;

  if (!check || typeof check !== "function") check = () => true;
  return new Promise((resolve, reject) => {
    const listener = async (...args: string[]) => {
      const finalCheck = await check(...args);
      if (check && typeof check === "function" && finalCheck) {
        dispose();
        resolve([...args]);
      }
    };

    // Removes listeneresolve
    const dispose = () => {
      bot.removeListener(event, listener);
      if (t) clearTimeout(t);
    };

    // Timeouts
    if (timeout) {
      t = setTimeout(() => {
        dispose();
        reject("timeout");
      }, timeout);
    }

    bot.on(event, listener);
  });
}

// Handles timeout errors
export function timeoutHandler(err: string, msg: Message, string: LocaleString, removeReactions = true) {
  if (err === "timeout") {
    msg
      .edit({
        embed: {
          title: string("global.ERROR"),
          description: string("global.TIMEOUT_REACHED"),
          color: convertHex("error"),
        },
      })
      .catch(() => {});

    // Removes leftover reactions
    if (removeReactions) msg.removeReactions().catch(() => {});
  } else throw err;
}
