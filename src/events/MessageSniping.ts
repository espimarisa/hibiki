/**
 * @file MessageSniping
 * @description Listens for message deletions and pushes snipe data
 */

import type { Message, TextChannel } from "eris";

import { Event } from "../classes/Event";

export class MessageSnipingEvent extends Event {
  events = ["messageDelete"];

  async run(_event: string, msg: Message<TextChannel>) {
    if (!msg?.channel?.guild || msg.author?.bot || !msg?.content || (!msg?.content && !msg.attachments?.[0])) return;

    // Gets guildconfig
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (guildconfig?.snipingEnable === false) return;

    // Ignored sniping channels
    let ignored: boolean;
    if (guildconfig?.snipingIgnore?.length) {
      guildconfig.snipingIgnore.forEach((channel) => {
        if (channel && msg.channel.id === channel && msg.channel.guild.channels.has(channel)) ignored = true;
      });
    }

    if (ignored) return;

    // Pushes snipe data
    this.bot.snipeData[msg.channel.id] = {
      id: msg.channel.id,
      content: msg.content,
      author: this.tagUser(msg.author) || "",
      authorpfp: msg.author?.dynamicAvatarURL() || "",
      msg: msg.id,
      attachment: msg.attachments?.[0]?.proxy_url || "",
    };
  }
}
