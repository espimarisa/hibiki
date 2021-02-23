const Command = require("../../structures/Command");
const format = require("../../utils/format");
const fetch = require("node-fetch");

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
      const body = await fetch(`https://nhentai.net/api/gallery/${encodeURIComponent(args.join(" "))}`).then(res => res.json().catch(() => {}));
      if (!body) return this.bot.embed("❌ Error", "Doujin not found.", msg, "error");
      book = body;
    } else if (args.length) {
      // Searches for a doujin
      const id = await fetch(`https://nhentai.net/api/galleries/search?query=${encodeURIComponent(args.join(" "))}`).then(res => res.json().catch(() => {}));
      if (!id.result || !id.result.length) return this.bot.embed("❌ Error", "Doujin not found.", msg, "error");
      const body = await fetch(`https://nhentai.net/api/gallery/${id.result[0].id}`).then(res => res.json().catch(() => {}));
      if (!body) return this.bot.embed("❌ Error", "No doujin found. Try again later.", msg, "error");
      book = body;
    } else {
      // Gets a random book
      const body = await fetch(`https://nhentai.net/api/gallery/${Math.floor(Math.random() * 310000)}`).then(res => res.json().catch(() => {}));
      if (!body) return this.bot.embed("❌ Error", "No doujin found. Try again later.", msg, "error");
      book = body;
    }

    // Sorts the tags
    if (book && book.tags && book.tags.length) {
      book.tags = book.tags.sort((a, b) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    }

    const fields = [];
    fields.push({
      name: "ID",
      value: book.id,
      inline: true,
    });

    fields.push({
      name: "Total Pages",
      value: book.num_pages,
      inline: true,
    });

    if (book.num_favorits && book.num_favorites.length) fields.push({
      name: "Favorites",
      value: book.num_favorites,
      inline: true,
    });

    if (book.upload_date) fields.push({
      name: "Uploaded",
      value: format.date(book.upload_date * 1000),
      inline: false,
    });

    if (book.tags && book.tags.length) {
      fields.push({
        name: "Tags",
        value: `${book.tags.slice(0, 10).map(t => `\`${t.name}\``).join(",")}${book.tags.length > 10 ? ` and ${book.tags.length - 10} more` : ""}`,
        inline: false,
      });
    }

    msg.channel.createMessage({
      embed: {
        color: 0xEC2854,
        fields: fields,
        author: {
          name: book.title.pretty || book.title.english || "Unknown Title",
          icon_url: "https://i.imgur.com/jboGQa0.png",
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
