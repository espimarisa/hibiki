const Command = require("../../structures/Command");
const format = require("../../utils/format");
const fetch = require("node-fetch");
const maxTags = 8;

class nhentaiCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["nh"],
      args: "[query:string]",
      description: "Returns info about a nhentai doujin.",
      nsfw: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    let book;
    // Looks for a valid ID
    if (args.length && /\d{1,6}/.test(args.join(" "))) {
      const body = await fetch(`https://nhentai.net/api/gallery/${encodeURIComponent(args.join(" "))}`)
        .then(res => res.json().catch(() => {}));
      book = body;
    } else if (args.length) {
      // Searches
      const id = await fetch(`https://nhentai.net/api/galleries/search?query=${encodeURIComponent(args.join(" "))}`)
        .then(res => res.json().catch(() => {}));
      if (!id.result || !id.result.length) return this.bot.embed("❌ Error", "Doujin not found.", msg, "error");
      const body = await fetch(`https://nhentai.net/api/gallery/${id.result[0].id}`)
        .then(res => res.json().catch(() => {}));
      if (!body) return this.bot.embed("❌ Error", "No doujin found. Try again later.", msg, "error");
      book = body;
    } else {
      // Gets a random book
      const body = await fetch(`https://nhentai.net/api/gallery/${Math.floor(Math.random() * 310000)}`)
        .then(res => res.json().catch(() => {}));
      book = body;
    }

    // Sorts the tags
    book.tags = book.tags.sort((a, b) => {
      if (a.name < b.name) return -1;
      if (a.name > b.name) return 1;
      return 0;
    });

    msg.channel.createMessage({
      embed: {
        color: 0xEC2854,
        fields: [{
          name: "ID",
          value: book.id,
          inline: true,
        }, {
          name: "Pages",
          value: book.num_pages,
          inline: true,
        }, {
          name: "Favorites",
          value: book.num_favorites,
          inline: true,
        }, {
          name: "Uploaded",
          value: format.date(book.upload_date * 1000),
          inline: false,
        }, {
          name: "Tags",
          value: `${book.tags.slice(0, maxTags).map(t => `\`${t.name}\``).join(",")}${book.tags.length > maxTags ? ` and ${book.tags.length - maxTags} more` : ""}`,
          inline: false,
        }],
        author: {
          name: book.title.pretty || book.title.english,
          icon_url: `https://i.imgur.com/jboGQa0.png`,
          url: `https://nhentai.net/g/${book.id}/`,
        },
        thumbnail: {
          url: `https://t.nhentai.net/galleries/${book.media_id}/cover.jpg`,
        },
      },
    });
  }
}

module.exports = nhentaiCommand;
