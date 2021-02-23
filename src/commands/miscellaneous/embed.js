const Command = require("../../structures/Command");
const waitFor = require("../../utils/waitFor");

class embedCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["embedmessage", "embedmsg", "rembed", "richembed"],
      description: "Creates a custom embed message.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    const emojis = [];
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

    const emojilabels = {
      "title": "Title",
      "description": "Description",
      "image.url": "Image",
      "thumbnail.url": "Thumbnail",
      "author.name": "Author Text",
      "author.icon_url": "Author Image",
      "footer.text": "Footer Text",
      "footer.icon_url": "Footer Image",
      "color": "Color",
      "timestamp": "Timestamp",
      "hibiki:done": "Done",
      "hibiki:cancel": "Cancel",
    };

    const emojidescriptions = {
      "title": "Title of the embed.",
      "description": "Main text of the embed.",
      "image.url": "Large image of the embed.",
      "thumbnail.url": "Thumbnail of the embed.",
      "author.name": "Text in the left corner.",
      "author.icon_url": "Image in the left corner.",
      "footer.text": "Text at the bottom.",
      "footer.icon_url": "Image at the bottom.",
      "color": "Hex color of the embed.",
      "timestamp": "Adds a timestamp.",
      "hibiki:done": "Sends the embed.",
      "hibiki:cancel": "Closes this menu.",
    };

    let embed = {};
    Object.entries(emojiactions).forEach(e => emojis.push(e[0]));

    // Sends the first embed
    const embedmsg = await msg.channel.createMessage({
      embed: {
        title: "🖊 Embed",
        color: this.bot.embed.color("general"),
        fields: Object.entries(emojiactions).map(e => {
          return {
            name: `${e[0]} ${emojilabels[e[1]] ? emojilabels[e[1]] : e[1]}`,
            value: emojidescriptions[e[1]] ? emojidescriptions[e[1]] : "No description",
            inline: true,
          };
        }),
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    // Sets a timeout for the reaction menu
    emojis.forEach(e => embedmsg.addReaction(e).catch(() => {}));
    await waitFor("messageReactionAdd", 120000, async (m, emoji, user) => {
      // Returns if needed
      if (m.id !== embedmsg.id) return false;
      if (user !== msg.author.id) return false;
      if (!emojiactions[emoji.name]) return false;
      let e = emojiactions[emoji.name];
      if (e === "hibiki:done") return true;
      if (e === "hibiki:cancel") {
        embedmsg.delete();
        embed = { error: "Embed cancelled." };
        return true;
      }

      // Removes the reaction from the message
      m.removeReaction(emoji.name, user).catch(() => {});
      if (e === "timestamp") { embed.timestamp = new Date(); return; }
      if (e.includes(".")) e = e.split(".");

      // Sends a prompt to the author
      this.bot.embed.edit("🖊 Embed",
        `Reply with the desired **${emojilabels[typeof e == "string" ? e : e.join(".")] ? `${emojilabels[typeof e == "string" ?
        e : e.join(".")][0].toLowerCase()}${emojilabels[typeof e == "string" ? e : e.join(".")].substring(1)}` : e[1]}**.`,
        embedmsg,
      );

      const [resp] = await waitFor("messageCreate", 30000, async message => {
        if (message.author.id !== msg.author.id) return false;
        if (message.channel.id !== msg.channel.id) return false;
        message.delete().catch(() => {});
        return true;
      }, this.bot).catch(() => {});

      // Edits the embed message
      embedmsg.edit({
        embed: {
          title: "🖊 Embed",
          color: this.bot.embed.color("general"),
          fields: Object.entries(emojiactions).map(em => {
            return {
              name: `${em[0]} ${emojilabels[em[1]] ? emojilabels[em[1]] : em[1]}`,
              value: emojidescriptions[em[1]] ? emojidescriptions[em[1]] : "No description",
              inline: true,
            };
          }),
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      }).catch(() => {});

      // Color checker
      if (typeof e == "string" && e !== "color" && e !== "timestamp") embed[e] = resp.content;
      else if (e === "color") {
        let finalhex;
        const hexcheck = /#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})/.exec(resp.content);
        if (hexcheck) args = args.slice(0, hexcheck.index) + args.slice(hexcheck.index + hexcheck[0].length, args.length);
        if (!hexcheck && isNaN(parseInt(`0x${args}`))) {
          finalhex = this.bot.embed.color("generaL");
        } else {
          if (!hexcheck) finalhex = parseInt(`0x${args}`);
          else finalhex = parseInt(hexcheck[0].replace("#", "0x"));
          if (finalhex >= 16777215) { finalhex = 16777215; }
        }
        embed[e] = finalhex;
      } else {
        // Image checker
        if ((e[0] === "image" || e[0] === "thumbnail" || e[0] === "author" || e[0] === "footer") && (e[1] === "url" || e[1] === "icon_url") &&
          resp.attachments && resp.attachments[0]) resp.content = resp.attachments[0].proxy_url;
        let obj = {};
        if (embed[e[0]]) obj = embed[e[0]];
        obj[e[1]] = resp.content;
        embed[e[0]] = obj;
      }
    }, this.bot).catch(() => {});

    if (!Object.keys(embed).length || Object.keys(embed).includes("error")) {
      embedmsg.delete().catch(() => {});
      return this.bot.embed("❌ Error", embed.error ? embed.error : "Invalid embed.", msg, "error");
    }

    // Sends the final embed
    if (!embed.color) embed.color = this.bot.embed.color("general");
    msg.channel.createMessage({ embed: embed }).catch(() => {});
    embedmsg.delete().catch(() => {});
  }
}

module.exports = embedCommand;
