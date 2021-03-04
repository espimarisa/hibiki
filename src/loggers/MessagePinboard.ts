/**
 * @file MessagePinboard
 * @description Posts messages reacted with the proper emoji to the pinboard
 * @module logger/MessagePinboard
 */

import type { EmbedOptions, Emoji, Message, TextChannel } from "eris";
import { Logger } from "../classes/Logger";
import { urlRegex } from "../helpers/constants";
import { dateFormat } from "../utils/format";
const TYPE = "pinChannel";

export class MessagePinboard extends Logger {
  events = ["messageReactionRemove", "messageReactionAdd"];

  async run(event: string, msg: Message<TextChannel>, emoji: Emoji, user: string) {
    if (!msg || !msg?.id || !msg?.channel?.guild?.id || msg?.author?.id === this.bot.user.id) return;

    // Tries to get missing message content
    if (!msg?.content) {
      try {
        msg = await msg.channel.getMessage(msg.id);
      } catch (err) {
        return;
      }
    }

    /**
     * Adds a message to the pinboard
     */

    if (event === "messageReactionAdd") {
      // Gets the server's config
      let pinboardEmbed;
      const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
      if (!guildconfig) return;

      const pinChannel = await this.getChannel(msg.channel.guild, TYPE, event, guildconfig);
      if (!pinChannel) return;
      const string = this.bot.localeSystem.getLocaleFunction(guildconfig?.locale ? guildconfig?.locale : this.bot.config.defaultLocale);

      // Gets the pin emoji
      const pin = guildconfig.pinEmoji ? guildconfig.pinEmoji : "📌";
      if (pin !== emoji?.name) return;

      // Gets channel and messages
      const pinReactions = msg.reactions?.[pin] as MessageReactions;
      const fullPinChannel = msg.channel.guild.channels.get(pinChannel) as TextChannel;
      const messages = await fullPinChannel.getMessages(50).catch(() => {});
      if (!messages) return;
      const pinnedMessage = messages.find(
        (m: Message) => m.embeds?.[0]?.footer?.text?.endsWith(msg.id) && m.author.id === this.bot.user.id,
      );

      // Sends the pinboard message
      if (pinReactions?.count) {
        // Sets what message content to use
        let messageContent = string("global.NO_CONTENT");
        if (msg.content) messageContent = msg.content;
        else if (msg?.embeds?.[0]) {
          if (msg.embeds[0].title !== null) messageContent = msg.embeds[0].title;
          if (msg.embeds[0].description) messageContent += `${msg.embeds[0].title !== null ? "\n" : ""}${msg.embeds[0].description}`;
        }

        // Edits the footer with the correct pin count
        if ((guildconfig.pinAmount ? guildconfig.pinAmount : 3) <= pinReactions.count) {
          if (pinnedMessage) {
            const embed = pinnedMessage.embeds?.[0];
            embed.footer.text = `${pin}${pinReactions.count} | ${msg.id}`;
            return pinnedMessage.edit({ embed: embed });
          }
        }

        // Sets the embed construct
        pinboardEmbed = {
          color: msg.convertHex("pinboard"),
          author: {
            name: msg.tagUser(msg.author),
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
              value: msg.channel.mention,
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
          footer: {
            text: `${pin}${pinReactions.count} | ${msg.id}`,
          },
        } as EmbedOptions;

        // Adds image URLs as an attachment
        let image;
        const urlCheck = msg.content.match(urlRegex);
        if (msg.embeds?.[0]?.image?.proxy_url && !msg.attachments?.[0]) image = msg.embeds?.[0]?.image?.proxy_url;
        if (urlCheck || msg.attachments?.[0]) {
          if (urlCheck?.[0].endsWith(".jpg") || urlCheck?.[0].endsWith(".png") || urlCheck?.[0].endsWith(".gif")) image = urlCheck?.[0];
          else if (msg.attachments?.[0]) image = msg.attachments[0].proxy_url;
        }

        // Sets the image
        pinboardEmbed.image = {
          url: image,
        };

        // Sends the pinboard content
        this.bot.createMessage(pinChannel, { embed: pinboardEmbed });
      }
    }

    /**
     * Removes a message from the pinboard
     */

    if (event === "messageReactionRemove") {
      // Gets the guild's config and what channel to send to
      const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
      if (!guildconfig) return;

      const pinChannel = await this.getChannel(msg.channel.guild, TYPE, event, guildconfig);
      if (!pinChannel) return;

      // Gets the pin emoji
      const pin = guildconfig.pinEmoji ? guildconfig.pinEmoji : "📌";
      if (pin !== emoji?.name) return;

      // Gets the channel, messages, and reactions
      // read above

      const fullPinChannel = msg.channel.guild.channels.get(pinChannel) as TextChannel;
      const messages = await fullPinChannel.getMessages(50).catch(() => {});
      if (!messages) return;
      const pinReactions = msg.reactions?.[pin] as MessageReactions;
      const pinnedMessage = messages.find(
        (m: Message) => m.embeds?.[0]?.footer?.text?.endsWith(msg.id) && m.author.id === this.bot.user.id,
      );
      if (!pinnedMessage) return;

      // Returns if the guild has disabled self pinning
      if (guildconfig.pinSelfPinning === false && msg.author.id === user) return;

      // Unpins the message if the count is at 0 or doesn't exist
      if (!pinReactions || pinReactions?.count === 0) return pinnedMessage.delete().catch(() => {});

      // Edits the footer with the correct star count
      if (guildconfig.pinAmount ? guildconfig.pinAmount : 3 <= pinReactions.count) {
        const embed = pinnedMessage.embeds?.[0];
        embed.footer.text = `${pin}${pinReactions?.count} | ${msg.id}`;
        pinnedMessage.edit({ embed: embed });
      } else {
        // Deletes the pinned message
        pinnedMessage.delete().catch(() => {});
      }
    }
  }
}
