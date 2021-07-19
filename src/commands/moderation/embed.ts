import type { Emoji, Message, TextChannel, User } from "eris";
import { Command } from "../../classes/Command";
import { timeoutHandler, waitFor } from "../../utils/waitFor";

export class EmbedCommand extends Command {
  description = "Creates a custom embed.";
  aliases = ["embedmessage", "embedmsg", "rembed", "richembed"];
  cooldown = 3000;
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[] | string) {
    const emojis: string[] = [];

    // Emoji action IDs
    const emojiactions = {
      "🇦": "title",
      "🇧": "description",
      "🖼": "image.url",
      "📷": "thumbnail.url",
      "👤": "author.name",
      "📸": "author.icon_url",
      "💬": "footer.text",
      "🎥": "footer.icon_url",
      "🖍": "color",
      "📅": "timestamp",
      "✅": "hibiki:done",
      "❌": "hibiki:cancel",
    };

    // Labels
    const emojilabels = {
      "title": msg.locale("global.TITLE"),
      "description": msg.locale("global.DESCRIPTION"),
      "image.url": msg.locale("global.IMAGE"),
      "thumbnail.url": msg.locale("global.THUMBNAIL"),
      "author.name": msg.locale("moderation.EMBED_AUTHORTEXT"),
      "author.icon_url": msg.locale("moderation.EMBED_AUTHORICON"),
      "footer.text": msg.locale("moderation.EMBED_FOOTERTEXT"),
      "footer.icon_url": msg.locale("moderation.EMBED_FOOTERICON"),
      "color": msg.locale("global.COLOR"),
      "timestamp": msg.locale("global.TIMESTAMP"),
      "hibiki:done": msg.locale("global.DONE"),
      "hibiki:cancel": msg.locale("global.CANCEL"),
    };

    // Descriptions
    const emojidescriptions = {
      "title": msg.locale("moderation.EMBED_TITLE"),
      "description": msg.locale("moderation.EMBED_DESCRIPTION"),
      "image.url": msg.locale("moderation.EMBED_IMAGEURL_DESCRIPTION"),
      "thumbnail.url": msg.locale("moderation.EMBED_THUMBNAIL_DESCRIPTION"),
      "author.name": msg.locale("moderation.EMBED_AUTHORNAME_DESCRIPTION"),
      "author.icon_url": msg.locale("moderation.EMBED_AUTHORICON_DESCRIPTION"),
      "footer.text": msg.locale("moderation.EMBED_FOOTERTEXT_DESCRIPTION"),
      "footer.icon_url": msg.locale("moderation.EMBED_FOOTERICON_DESCRIPTION"),
      "color": msg.locale("moderation.EMBED_COLOR_DESCRIPTION"),
      "timestamp": msg.locale("moderation.EMBED_TIMESTAMP"),
      "hibiki:done": msg.locale("moderation.EMBED_SEND"),
      "hibiki:cancel": msg.locale("moderation.EMBED_CANCEL"),
    };

    let embed: Record<string, any> = {};
    Object.entries(emojiactions).forEach((e) => emojis.push(e[0]));

    // Sends the first embed
    const embedmsg = await msg.channel.createMessage({
      embed: {
        title: `🖊 ${msg.locale("global.EMBED")}`,
        color: msg.convertHex("general"),
        fields: Object.entries(emojiactions).map((e) => {
          return {
            name: `${e[0]} ${emojilabels[e[1]] ? emojilabels[e[1]] : e[1]}`,
            value: emojidescriptions[e[1]] ? emojidescriptions[e[1]] : msg.locale("global.NO_CONTENT"),
            inline: true,
          };
        }),
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    // Sets a timeout for the reaction menu
    emojis.forEach((e) => embedmsg.addReaction(e).catch(() => {}));
    await waitFor(
      "messageReactionAdd",
      300000,
      async (m: Message<TextChannel>, emoji: Emoji, user: User) => {
        // Returns if needed
        if (m.id !== embedmsg.id) return false;
        if (user.id !== msg.author.id) return false;
        if (!emojiactions[emoji.name]) return false;
        let e = emojiactions[emoji.name];
        if (e === "hibiki:done") return true;
        if (e === "hibiki:cancel") {
          embedmsg.delete();
          embed = { error: msg.locale("global.CANCELLED") };
          return true;
        }

        // Removes the reaction from the message
        m.removeReaction(emoji.name, user.id).catch(() => {});
        if (e === "timestamp") {
          embed.timestamp = new Date();
          return;
        }
        if (e.includes(".")) e = e.split(".");

        // Sends a prompt to the author
        embedmsg.editEmbed(
          `🖊 ${msg.locale("global.EMBED")} `,
          // This is uglier than ur mum ngl
          msg.locale("global.ASKFOR", {
            item: emojilabels[typeof e == "string" ? e : e.join(".")]
              ? `${emojilabels[typeof e == "string" ? e : e.join(".")][0].toLowerCase()}${emojilabels[
                  typeof e == "string" ? e : e.join(".")
                ].substring(1)}`
              : e[1]``,
          }),
        );

        const [resp]: any = await waitFor(
          "messageCreate",
          60000,
          async (message: Message<TextChannel>) => {
            if (message.author.id !== msg.author.id) return false;
            if (message.channel.id !== msg.channel.id) return false;
            message.delete().catch(() => {});
            return true;
          },
          this.bot,
        ).catch((err) => {
          timeoutHandler(err, embedmsg, msg.locale);
        });

        // Edits the embed message
        embedmsg
          .edit({
            embed: {
              title: `🖊 ${msg.locale("global.EMBED")}`,
              color: msg.convertHex("general"),
              fields: Object.entries(emojiactions).map((em) => {
                return {
                  name: `${em[0]} ${emojilabels[em[1]] ? emojilabels[em[1]] : em[1]}`,
                  value: emojidescriptions[em[1]] ? emojidescriptions[em[1]] : msg.locale("global.NO_CONTENT"),
                  inline: true,
                };
              }),
              footer: {
                text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
                icon_url: msg.author.dynamicAvatarURL(),
              },
            },
          })
          .catch(() => {});

        // Color checker
        if (typeof e == "string" && e !== "color" && e !== "timestamp") embed[e] = resp.content;
        else if (e === "color") {
          let finalhex: number;

          // Hex checker
          const hexcheck = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/.exec(resp.content);
          if (hexcheck) args = `${args.slice(0, hexcheck.index)}${args.slice(hexcheck.index + hexcheck[0].length, args.length)}`;

          // If no valid hex was given, default
          if (!hexcheck && isNaN(parseInt(`0x${args}`))) {
            finalhex = msg.convertHex("general");
          } else {
            // Tries to parse decimal input
            if (!hexcheck) finalhex = parseInt(`0x${args}`);
            else finalhex = parseInt(hexcheck[0].replace("#", "0x"));
            if (finalhex >= 16777215) finalhex = 16777215;
          }

          // Sets the colour
          embed[e] = finalhex;
        } else {
          // Image checker
          if (
            (e[0] === "image" || e[0] === "thumbnail" || e[0] === "author" || e[0] === "footer") &&
            (e[1] === "url" || e[1] === "icon_url") &&
            resp.attachments?.[0]
          )
            resp.content = resp.attachments[0].proxy_url;
          let obj = {};
          if (embed[e[0]]) obj = embed[e[0]];
          obj[e[1]] = resp.content;
          embed[e[0]] = obj;
        }
      },
      this.bot,
    ).catch(() => {});

    // Invalid embed handler
    if (!Object.keys(embed).length || Object.keys(embed).includes("error")) {
      return embedmsg.editEmbed(msg.locale("global.ERROR"), embed.error ? embed.error : msg.locale("moderation.EMBED_INVALID"), "error");
    }

    // Sends the final embed
    if (!embed.color) embed.color = msg.convertHex("general");
    await msg.channel.createMessage({ embed: embed }).catch(() => {});
    await embedmsg.delete().catch(() => {});
  }
}
