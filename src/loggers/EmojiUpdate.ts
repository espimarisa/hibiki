/**
 * @file Emoji logger
 * @descriptionL Logs when an emoji is created, deleted, or updated
 * @module logger/EmojiUpdate.ts
 */

import type { Embed, Emoji, Guild } from "eris";
import { Logger } from "../classes/Logger";
const TYPE = "eventLogging";

export class EmojiUpdate extends Logger {
  events = ["guildEmojisUpdate"];

  async run(event: string, guild: Guild, emojis: Emoji[], oldEmojis: Emoji[]) {
    if (!guild || emojis === oldEmojis) return;
    const guildconfig = await this.bot.db.getGuildConfig(guild.id);
    const channel = await this.getChannel(guild, TYPE, event, guildconfig);
    if (!channel) return;
    const string = this.bot.localeSystem.getLocaleFunction(
      guildconfig.guildLocale ? guildconfig.guildLocale : this.bot.config.defaultLocale,
    );

    // Gets changes
    let changes: Emoji[] = [];
    changes = oldEmojis
      .filter((oldEmoji) => !emojis.some((newEmoji) => JSON.stringify(newEmoji) === JSON.stringify(oldEmoji)))
      .concat(emojis.filter((newEmoji) => !oldEmojis.some((oldEmoji) => JSON.stringify(newEmoji) === JSON.stringify(oldEmoji))));

    if (!changes.length) return;

    // Finds duplicates; ids
    const duplicates: string[] = [];
    const changesIds = changes.map((c) => c.id);
    const emojisIds = emojis.map((c) => c.id);
    const changesString: string[] = [];
    changes.forEach((change, i) => {
      const lastIndex = changesIds.lastIndexOf(change.id);
      if (lastIndex !== i) {
        changesString.push(string("logger.EMOJI_RENAMED", { name: changes[lastIndex].name, oldname: change.name }));

        duplicates.push(changes[lastIndex].id);
        // Emoji removals
      } else if (!emojisIds.includes(change.id)) changesString.push(string("logger.EMOJI_DELETED", { emoji: change.name }));
      // Emoji additions
      else if (!duplicates.includes(change.id)) changesString.push(string("logger.EMOJI_CREATED", { emoji: change.name }));
    });

    if (!changesString.length) return;

    // Sends the embed
    const embed = {
      title: `🔧 ${string("logger.EMOJI_UPDATED")}`,
      description: changesString.join("\n"),
      color: this.convertHex("general"),
      fields: [],
    } as Embed;

    this.bot.createMessage(channel, { embed: embed });
  }
}
