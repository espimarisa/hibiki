/**
 * @file Pagifier
 * @description Splits embed content into multiple navigatable pages
 * @module utils/pagify
 */

import type { EmbedOptions, Emoji, Member, Message } from "eris";
import type { HibikiClient } from "../classes/Client";
import { TextChannel } from "eris";
import { convertHex } from "../helpers/embed";
import { waitFor } from "./waitFor";

const backEmoji = "⬅️";
const forwardEmoji = "➡️";
const exitEmoji = "❌";

export async function pagify(
  pages: EmbedOptions[],
  msg: Message<TextChannel> | TextChannel,
  bot: HibikiClient,
  user: string,
  exitEmbed = { title: "❌ Exited", color: convertHex("error") },
  edit = true,
  footerText = "%c/%a",
  footerIcon?: string,
  initialPage = 0,
) {
  let page = initialPage;

  // Embed content
  const pagifyEmbed = {
    embed: footerText
      ? {
          ...pages[page],
          ...{
            footer: { text: footerText.replace(/%c/, (page + 1).toString()).replace(/%a/, pages.length.toString()), icon_url: footerIcon },
          },
        }
      : pages[page],
  };

  // Edits pagify embeds
  if (msg instanceof TextChannel) msg = await msg.createMessage(pagifyEmbed);
  if (edit) msg.edit(pagifyEmbed);

  // Adds the initial emojis
  await msg.addReaction(backEmoji);
  await msg.addReaction(forwardEmoji);
  await msg.addReaction(exitEmoji);

  // Waits for reaction input
  await waitFor(
    "messageReactionAdd",
    600000,
    async (_msg: Message, emoji: Emoji, reactor: Member) => {
      if (user !== null && reactor.id !== user) return;
      if (emoji.name === backEmoji) {
        (msg as Message<TextChannel>).removeReaction(backEmoji, reactor.id);
        if (page === 0) return;
        page--;
        const p = pages[page];
        if (footerText)
          p.footer = { text: footerText.replace(/%c/, (page + 1).toString()).replace(/%a/, pages.length.toString()), icon_url: footerIcon };
        msg.edit({ embed: p });
      }

      // Handles going forward
      else if (emoji.name === forwardEmoji) {
        (msg as Message<TextChannel>).removeReaction(forwardEmoji, reactor.id);
        if (page >= pages.length - 1) return;
        page++;
        const p = pages[page];

        // Custom footer
        if (footerText) {
          p.footer = { text: footerText.replace(/%c/, (page + 1).toString()).replace(/%a/, pages.length.toString()), icon_url: footerIcon };
        }

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
      (msg as Message<TextChannel>).removeReaction(backEmoji);
      (msg as Message<TextChannel>).removeReaction(forwardEmoji);
    }
  });
}
