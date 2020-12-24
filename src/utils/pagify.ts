/**
 * @file Pagifier
 * @description Splits embed content into multiple navigatable pages
 * @module utils/pagify
 */

import type { Emoji, Member, Message } from "eris";
import type { HibikiClient } from "../classes/Client";
import { waitFor } from "./waitFor";

const backEmoji = "⬅️";
const forwardEmoji = "➡️";
const exitEmoji = "❌";

export async function pagify(
  pages: any,
  msg: Message,
  bot: HibikiClient,
  user: string | null = null,
  exitEmbed = { title: "❌ Exited", color: msg.convertHex("general") },
  edit = true,
  footerText = "%c/%a",
  initialPage = 0,
) {
  let page = initialPage as any;

  // Edits pagify embeds
  if (edit) {
    msg.edit({
      embed: footerText
        ? { ...pages[page], ...{ footer: { text: footerText.replace(/%c/, page + 1).replace(/%a/, pages.length) } } }
        : pages[page],
    });
  }

  // Adds the initial emojis
  await msg.addReaction(backEmoji);
  await msg.addReaction(forwardEmoji);
  await msg.addReaction(exitEmoji);

  // Waits for reaction input
  await waitFor(
    "messageReactionAdd",
    60000,
    async (_msg: Message, emoji: Emoji, reactor: Member) => {
      if (user !== null && reactor.id !== user) return;

      // Handles going back
      if (emoji.name === backEmoji) {
        msg.removeReaction(backEmoji, reactor.id);
        if (page === 0) return;
        page--;
        const p = pages[page];
        if (footerText) p.footer = { text: footerText.replace(/%c/, page + 1).replace(/%a/, pages.length) };
        msg.edit({ embed: p });
      }

      // Handles going forward
      else if (emoji.name === forwardEmoji) {
        msg.removeReaction(forwardEmoji, reactor.id);
        if (page >= pages.length - 1) return;
        page++;
        const p = pages[page];
        if (footerText) p.footer = { text: footerText.replace(/%c/, page + 1).replace(/%a/, pages.length) };
        msg.edit({ embed: p });
      }

      // Exits the pagify
      else if (emoji.name === exitEmoji) {
        msg.edit({ embed: exitEmbed });
        return true;
      }
    },
    bot,
  ).catch((err) => {
    if (err === "timeout") {
      msg.removeReaction(backEmoji);
      msg.removeReaction(forwardEmoji);
    }
  });
}
