/**
 * @file MessageUpdate Logger
 * @description Logs when a message is deleted or updated
 * @module logger/MessageUpdate
 */

import type { Message, TextChannel } from "eris";
import { dateFormat } from "../utils/format";
import { Logger } from "../classes/Logger";
import { urlRegex } from "../helpers/constants";
const TYPE = "messageLogging";

export class MessageUpdate extends Logger {
  events = ["messageUpdate", "messageDelete"];

  async run(event: string, msg: Message<TextChannel>, oldmsg: Message<TextChannel>) {
    if (!msg || !msg.author) return;
    if (msg.author.id === this.bot.user.id) return;
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig?.logBotMessages && msg.author.bot) return;

    // Sets what message content to use
    let messageContent = "No content";
    let oldMessageContent = "No content";
    if (msg.content) messageContent = msg.content;
    else if (msg.embeds && msg.embeds[0]) {
      if (msg.embeds[0].title !== null) messageContent = msg.embeds[0].title;
      if (msg.embeds[0].description) messageContent += `${msg.embeds[0].title !== null ? "\n" : ""}${msg.embeds[0].description}`;
    }

    // Sets old message content if it was an edit
    if (oldmsg) {
      if (oldmsg.content) oldMessageContent = oldmsg.content;
      else if (oldmsg.embeds && oldmsg.embeds[0]) {
        if (oldmsg.embeds[0].title !== null) oldMessageContent = msg.embeds[0].title;
        if (oldmsg.embeds[0].description) {
          oldMessageContent += `${msg.embeds[0].title !== null ? "\n" : ""}${msg.embeds[0].description}`;
        }
      }
    }

    /**
     * Logs message deletions
     */

    if (event === "messageDelete") {
      if (!msg || !msg.author) return;

      const channel = await this.getChannel(msg.channel, TYPE, event, guildconfig);
      if (!channel) return;

      let image;
      const urlCheck = msg.content.match(urlRegex);
      if (msg.embeds?.[0]?.image?.proxy_url && !msg.attachments?.[0]) image = msg.embeds?.[0]?.image?.proxy_url;
      if (urlCheck || msg.attachments?.[0]) {
        if (urlCheck?.[0].endsWith(".jpg") || urlCheck?.[0].endsWith(".png") || urlCheck?.[0].endsWith(".gif")) image = urlCheck?.[0];
        else if (msg.attachments?.[0]) image = msg.attachments[0].proxy_url;
      }

      // Sets the image
      this.bot.createMessage(channel, {
        embed: {
          color: msg.convertHex("error"),
          author: {
            name: `${this.tagUser(msg.author)}'s message was deleted.`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Content",
              value: `\`\`\`${messageContent}\`\`\``,
              inline: false,
            },
            {
              name: "Channel",
              value: msg.channel.mention || "Unknown",
              inline: true,
            },
            {
              name: "ID",
              value: msg.id,
              inline: true,
            },
            {
              name: "Sent On",
              value: dateFormat(msg.timestamp),
              inline: false,
            },
          ],
          image: {
            url: image || null,
          },
        },
      });
    }

    /**
     * Logs message updates
     */

    if (event === "messageUpdate") {
      const channel = await this.getChannel(msg.channel, TYPE, event, guildconfig);
      if (!channel) return;
      if (messageContent === oldMessageContent) return;

      this.bot.createMessage(channel, {
        embed: {
          color: msg.convertHex("error"),
          author: {
            name: `${this.tagUser(msg.author)}'s message was updated.`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Old Content",
              value: `\`\`\`${oldMessageContent}\`\`\``,
              inline: false,
            },
            {
              name: "New Content",
              value: `\`\`\`${messageContent}\`\`\``,
              inline: false,
            },
            {
              name: "Channel",
              value: msg.channel.mention || "Unknown",
              inline: true,
            },
            {
              name: "Message",
              value: `[Jump to](${msg.jumpLink})`,
              inline: true,
            },
            {
              name: "Sent On",
              value: dateFormat(msg.timestamp),
              inline: false,
            },
          ],
        },
      });
    }
  }
}
