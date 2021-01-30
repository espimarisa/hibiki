/**
 * @fileoverview waitFor
 * @description Waits for an event to happen and acts on it
 * @module utils/waitFor
 */

import type { Message } from "eris";
import type { HibikiClient } from "../classes/Client";
import { convertHex } from "../helpers/embed";

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
export function timeoutHandler(err: string, omsg: Message, stringFunc: LocaleString, removeReactions = true) {
  if (err === "timeout") {
    omsg
      .edit({
        embed: {
          title: stringFunc("global.ERROR"),
          description: stringFunc("global.TIMEOUT_REACHED"),
          color: convertHex("error"),
        },
      })
      .catch(() => {});

    // Removes leftover reactions
    if (removeReactions) omsg.removeReactions().catch(() => {});
  } else throw err;
}
