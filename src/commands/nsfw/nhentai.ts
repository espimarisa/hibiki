import type { EmbedField, Emoji, Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import { pagify } from "../../utils/pagify";
import { waitFor } from "../../utils/waitFor";
import axios from "axios";
const readEmoji = "📖";

export class nhentaiCommand extends Command {
  description = "sends nhentai..bro";
  args = "<query:string>";
  cooldown = 4000;
  nsfw = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    let book: any;
    // Looks for a valid ID
    const query = encodeURIComponent(args.join(" "));
    if (args.length && /\d{1,6}/.test(args.join(" "))) {
      const body = await axios.get(`https://nhentai.net/api/gallery/${query}`).catch(() => {});
      if (!body || !body?.data) return msg.createEmbed(msg.string("global.ERROR"), msg.string("nsfw.NHENTAI_NOTFOUND"), "error");
      book = body.data;
    } else {
      // Searches for a doujin
      const id = await axios.get(`https://nhentai.net/api/galleries/search?query=${query}`).catch(() => {});
      if (!id || !id.data?.result?.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("nsfw.NHENTAI_NOTFOUND"), "error");

      // Gets individual book data
      const body = await axios.get(`https://nhentai.net/api/gallery/${id.data.result[0].id}`).catch(() => {});
      if (!body || !body.data) return msg.createEmbed(msg.string("global.ERROR"), msg.string("nsfw.NHENTAI_NOTFOUND"), "error");
      book = body.data;
    }

    // Sorts the tags
    if (book?.tags?.length) {
      book.tags = book.tags.sort((a: Record<string, string>, b: Record<string, string>) => {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
      });
    }

    // Embed fields
    const fields: EmbedField[] = [];

    // Book ID
    fields.push({
      name: msg.string("global.ID"),
      value: `${book.id}`,
      inline: true,
    });

    // Total pages
    fields.push({
      name: msg.string("nsfw.NHENTAI_TOTALPAGES"),
      value: `${book.num_pages}`,
      inline: true,
    });

    // Favourites
    if (book.num_favorites?.length) {
      fields.push({
        name: msg.string("nsfw.NHENTAI_FAVORITES"),
        value: `${book.num_favorites}`,
        inline: true,
      });
    }

    // Upload date
    if (book.upload_date) {
      fields.push({
        name: msg.string("global.UPLOADED"),
        value: dateFormat(book.upload_date * 1000),
        inline: false,
      });
    }
    // Tags
    if (book.tags?.length) {
      fields.push({
        name: msg.string("nsfw.NHENTAI_TAGS"),
        value: `${book.tags
          .slice(0, 10)
          .map((t: Record<string, string>) => `\`${t.name}\``)
          .join(",")}${book.tags.length > 10 ? msg.string("nsfw.NHENTAI_OVERFLOW", { length: book.tags.length - 10 }) : ""}`,
        inline: false,
      });
    }

    // Sends the info embed
    const omsg = await msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        fields: fields,
        author: {
          name: book.title.pretty || book.title.english || msg.string("global.UNKNOWN"),
          icon_url: "https://i.imgur.com/jboGQa0.png",
          url: `https://nhentai.net/g/${book.id}/`,
        },
        thumbnail: {
          url: `https://t.nhentai.net/galleries/${book.media_id}/cover.jpg`,
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: msg.string("nsfw.NHENTAI_STARTREADING"),
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    // Adds reading reaction
    omsg.addReaction(readEmoji);

    // Waits for reader reaction
    const m = await waitFor(
      "messageReactionAdd",
      10000,
      (m: Message, emoji: Emoji, reacter: Member) => {
        if (m.id !== omsg.id) return;
        if (reacter.id !== msg.author.id) return;
        if (emoji.name !== readEmoji) return;
        return true;
      },

      this.bot,
    ).catch(() => {});

    omsg.removeReactionEmoji(readEmoji);
    if (m === undefined) return;

    pagify(
      book.images.pages.map((_p: number, i: number) => ({
        color: msg.convertHex("general"),
        title: `📖 ${book.title.pretty || book.title.english || msg.string("global.UNKNOWN")}`,
        image: {
          url: `https://i.nhentai.net/galleries/${book.media_id}/${i + 1}.jpg`,
        },
      })),
      omsg,
      this.bot,
      msg.author.id,
      { title: msg.string("global.EXITED"), color: msg.convertHex("error") },
      true,
      msg.string("global.RAN_BY", { author: msg.tagUser(msg.author), extra: `%c/%a` }),
      msg.author.dynamicAvatarURL(),
    );
  }
}
