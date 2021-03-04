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
    const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : this.bot.config.defaultLocale);

    // Sets what message content to use
    let messageContent = string("global.NO_CONTENT");
    let oldMessageContent = string("global.NO_CONTENT");
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
            name: string("logger.MESSAGE_DELETED", { member: this.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.CONTENT"),
              value: `\`\`\`${messageContent?.substring(0, 1000)}${messageContent.length > 1000 ? "..." : ""}\`\`\``,
              inline: false,
            },
            {
              name: string("global.CHANNEL"),
              value: msg.channel.mention || string("global.UNKNOWN"),
              inline: true,
            },
            {
              name: string("global.ID"),
              value: msg.id,
              inline: true,
            },
            {
              name: string("global.SENT_ON"),
              value: dateFormat(msg.timestamp, string),
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
      if (!msg || !oldmsg) return;
      if (messageContent === oldMessageContent) return;
      const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
      if (!guildconfig?.logBotMessages && msg.author.bot) return;
      const channel = await this.getChannel(msg.channel, TYPE, event, guildconfig);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: msg.convertHex("error"),
          author: {
            name: string("logger.MESSAGE_UPDATED", { member: this.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: [
            {
              name: string("global.OLD_CONTENT"),
              value: `\`\`\`${oldMessageContent?.substring(0, 1000)}${oldMessageContent.length > 1000 ? "..." : ""}\`\`\``,
              inline: false,
            },
            {
              name: string("global.NEW_CONTENT"),
              value: `\`\`\`${messageContent?.substring(0, 1000)}${messageContent.length > 1000 ? "..." : ""}\`\`\``,
              inline: false,
            },
            {
              name: string("global.CHANNEL"),
              value: msg.channel.mention || msg.string("global.UNKNOWN"),
              inline: true,
            },
            {
              name: string("global.MESSAGE"),
              value: `[${string("global.JUMP_TO")}](${msg.jumpLink})`,
              inline: true,
            },
            {
              name: string("global.SENT_ON"),
              value: dateFormat(msg.timestamp, string),
              inline: false,
            },
          ],
        },
      });
    }
  }
}
