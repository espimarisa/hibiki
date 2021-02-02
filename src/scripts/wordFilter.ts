/**
 * @file Word filter
 * @description Checks words to see if they're filtered
 * @module scripts/wordFilter
 */

import type { Message, TextChannel } from "eris";
const regexCache = {};

export function wordFilter(guildconfig: GuildConfig, msg: Message<TextChannel>) {
  if (!guildconfig?.filteredWords || !msg.content) return;

  const filteredWord = guildconfig?.filteredWords.every((word) => {
    let regex = regexCache[word];
    if (!regex) {
      regexCache[word] = new RegExp(`\\b${word}\\b`);
      regex = regexCache[word];
    }

    return !regex.test(msg.content);
  });

  if (!filteredWord) msg.delete();
}
