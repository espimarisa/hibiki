/**
 * @file Ask
 * @description Asks for a user's input and validates it
 */

import type { HibikiClient } from "../classes/Client";
import type { Message } from "eris";
import { waitFor } from "./waitFor";

/** Asks a user for a yes or no response */
export async function askYesNo(bot: HibikiClient, msg: Message) {
  if (!msg.content) return;
  let response: any;

  const no = msg.string("global.NO").toLowerCase();
  const yes = msg.string("global.YES").toLowerCase();
  const sameStartingChar = no[0] === yes[0];

  await waitFor(
    "messageCreate",
    3000,
    (m: Message) => {
      if (!m.content) return;
      if (m.author.id !== msg.author.id) return;
      if (m.channel?.id !== msg?.channel.id) return;

      // If two locales start with the same
      if (sameStartingChar) {
        if (m.content.toLowerCase() === no || m.content.toLowerCase() === no[0]) response = { msg: m, response: false };
        else if (m.content.toLowerCase() === yes || m.content.toLowerCase() === yes[0]) response = { msg: m, response: true };

        // compares shit
      } else if (m.content.toLowerCase().startsWith(no[0])) response = { msg: m, response: false };
      else if (m.content.toLowerCase().startsWith(yes[0])) response = { msg: m, response: true };

      if (!response) response = { msg: null, response: false };
      return true;
    },

    bot,
  );

  return response;
}
