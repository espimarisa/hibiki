/**
 * @fileoverview waitFor
 * @description Waits for an event to happen and acts on it
 * @module utils/waitFor
 */

import type { HibikiClient } from "../classes/Client";

export function waitFor(event: string, timeout: number, check: any, bot: HibikiClient) {
  let t: NodeJS.Timeout;

  if (!check || typeof check !== "function") check = () => true;
  return new Promise((rs, rj) => {
    const listener = async (...args: any[]) => {
      const finalCheck = await check(...args);
      if (check && typeof check === "function" && finalCheck) {
        dispose();
        rs([...args]);
      }
    };

    // Removes listeners
    const dispose = () => {
      bot.removeListener(event, listener);
      if (t) clearTimeout(t);
    };

    // Timeouts
    if (timeout) {
      t = setTimeout(() => {
        dispose();
        rj("timeout");
      }, timeout);
    }

    bot.on(event, listener);
  });
}
