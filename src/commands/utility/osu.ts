import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import axios from "axios";

export class OsuCommand extends Command {
  description = "Returns osu! stats from a player.";
  aliases = ["osu!", "osustats"];
  requiredkeys = ["osu"];
  args = "<account:string>";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));

    // Gets user data
    const body = await axios.get(`https://osu.ppy.sh/api/get_user?k=${this.bot.config.keys.osu}&u=${query}&type=string`).catch(() => {});

    // If nothing was found
    if (!body || !body.data?.length) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");
    }

    const data = body.data[0];
    const fields: EmbedField[] = [];

    // If the user hasn't played
    if (!data.pp_raw && !data.playcount && !data.level && !data.accuracy && !data.playcount) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NODATA"), "error");
    }

    // Join date
    if (data.join_date) {
      fields.push({
        name: msg.string("global.CREATED_AT"),
        value: dateFormat(data.join_date, msg.string),
        inline: false,
      });
    }

    // User ID
    fields.push({
      name: msg.string("global.ID"),
      value: data.user_id,
      inline: true,
    });

    // Total PP
    if (data.pp_raw > 0) {
      fields.push({
        name: msg.string("utility.OSU_PP"),
        value: data.pp_raw,
        inline: true,
      });
    }

    // Global ranking
    if (data.pp_rank > 0) {
      fields.push({
        name: msg.string("utility.OSU_GLOBAL"),
        value: data.pp_rank,
        inline: true,
      });
    }

    // Country ranking
    if (data.pp_country_rank > 0) {
      fields.push({
        name: msg.string("utility.OSU_COUNTRY"),
        value: `${data.pp_country_rank} :flag_${data.country.toLowerCase()}:`,
        inline: true,
      });
    }

    // Level
    if (data.level > 0) {
      fields.push({
        name: msg.string("global.LEVEL"),
        value: parseInt(data.level).toFixed(0),
        inline: true,
      });
    }

    // Accuracy
    if (data.accuracy > 0) {
      fields.push({
        name: msg.string("utility.OSU_ACCURACY"),
        value: `${Math.round(data.accuracy)}%`,
        inline: true,
      });
    }

    // Play count
    if (data.playcount > 0) {
      fields.push({
        name: msg.string("utility.OSU_PLAYS"),
        value: parseInt(data.playcount).toFixed(0),
        inline: true,
      });
    }

    // Total score
    if (data.total_score > 0) {
      fields.push({
        name: msg.string("utility.OSU_SCORE"),
        value: data.total_score,
        inline: true,
      });
    }

    // Sends info
    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        fields: fields,
        author: {
          name: `${data.username}`,
          icon_url: `https://a.ppy.sh/${data.user_id}?ifyouseethisyoureallyneedtogetalife.png` || "",
          url: `https://osu.ppy.sh/users/${data.user_id}`,
        },
        thumbnail: {
          url: `https://a.ppy.sh/${data.user_id}?ifyouseethisyoureallyneedtogetalife.png` || "",
        },
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
