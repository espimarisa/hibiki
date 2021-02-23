const Command = require("../../structures/Command");
const format = require("../../utils/format");
const fetch = require("node-fetch");

class osuCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<profile:string>",
      description: "Displays info about an osu! account.",
      requiredkeys: ["osu"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const formatNumber = num => Number.parseFloat(num).toLocaleString({
      maximumFractionDigits: 2,
    });

    // Finds the player
    const user = args.join(" ");
    const body = await fetch(`https://osu.ppy.sh/api/get_user?k=${this.bot.key.osu}&u=${user}&type=string`)
      .then(res => res.json().catch(() => {}));
    if (!body.length) return this.bot.embed("❌ Error", "Account not found.", msg, "error");
    const data = body[0];

    if (!data.pp_raw && !data.playcount && !data.level && !data.accuracy && !data.playcount) {
      return this.bot.embed("❌ Error", "The account provided has no data.", msg, "error");
    }

    const fields = [];
    fields.push({ name: "User ID", value: data.user_id, inline: true });
    if (data.pp_raw > 0) fields.push({ name: "PP", value: data.pp_raw, inline: true });
    if (data.pp_rank > 0) fields.push({ name: "Global Ranking", value: data.pp_rank, inline: true });

    if (data.pp_country_rank > 0) {
      fields.push({
        name: "Country Rank",
        value: `${data.pp_country_rank} :flag_${data.country.toLowerCase()}:`,
        inline: true,
      });
    }

    if (data.level > 0) fields.push({ name: "Level", value: formatNumber(data.level), inline: true });
    if (data.accuracy > 0) fields.push({ name: "Accuracy", value: `${Math.round(data.accuracy)}%`, inline: true });
    if (data.playcount > 0) fields.push({ name: "Plays", value: formatNumber(data.playcount), inline: true });
    if (data.total_score > 0) fields.push({ name: "Total Score", value: data.total_score, inline: true });
    if (data.join_date) fields.push({ name: "Join Date", value: format.date(data.join_date), inline: true });

    msg.channel.createMessage({
      embed: {
        color: 0xE6649E,
        fields: fields,
        author: {
          name: data.username,
          icon_url: `https://a.ppy.sh/${data.user_id}?ifyouseethisyoureallyneedtogetalife.png` || "https://i.imgur.com/tRXeTcU.png",
          url: `https://osu.ppy.sh/users/${data.user_id}`,
        },
        thumbnail: {
          url: `https://a.ppy.sh/${data.user_id}?ifyouseethisyoureallyneedtogetalife.png` || "https://i.imgur.com/tRXeTcU.png",
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = osuCommand;
