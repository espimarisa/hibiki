const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class fortniteCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<username:string> [platform:string]",
      description: "Returns Fortnite account stats.",
      requiredkeys: ["gametracker"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const username = args[0];
    const platform = args[1];

    if (!username) return;
    if (!["psn", "xbox", "pc"].includes(platform) && platform !== undefined) {
      return this.bot.embed("🎮 Fortnite", "Valid platforms are `pc`, `psn`, and `xbox`.", msg);
    }

    // Sends the first embed
    const fortnitemsg = await this.bot.embed("🎮 Fortnite", "Getting info...", msg);
    const body = await fetch(
      `https://api.fortnitetracker.com/v1/profile/${platform !== undefined ? encodeURIComponent(platform) : "pc"}/${encodeURIComponent(username)}`, {
        headers: {
          "TRN-Api-Key": this.bot.key.gametracker,
          "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
        },
      }).then(res => res.json().catch(() => {}));

    if (!body || body.error || !body.lifeTimeStats) return this.bot.embed.edit("❌ Error", "No information found.", fortnitemsg, "error");

    // Embed fields
    const fields = [];

    // Total wins
    if (body.lifeTimeStats[8].value) fields.push({
      name: "Wins",
      value: body.lifeTimeStats[8].value,
      inline: true,
    });


    // Total matches
    if (body.lifeTimeStats[7].value) fields.push({
      name: "Matches",
      value: body.lifeTimeStats[7].value,
      inline: true,
    });


    if (body.lifeTimeStats[10].value) fields.push({
      name: "Kills",
      value: body.lifeTimeStats[10].value,
      inline: true,
    });

    // Total score
    if (body.lifeTimeStats[6].value) fields.push({
      name: "Score",
      value: body.lifeTimeStats[6].value,
      inline: true,
    });


    // K/D Ratio
    if (body.lifeTimeStats[11].value) fields.push({
      name: "K/D Ratio",
      value: body.lifeTimeStats[11].value,
      inline: true,
    });

    // Win percentage
    if (body.lifeTimeStats[9].value) fields.push({
      name: "Win Percent",
      value: body.lifeTimeStats[9].value,
      inline: true,
    });

    fortnitemsg.edit({
      embed: {
        title: `🤙 Fortnite stats for **${body.epicUserHandle}** on **${body.platformNameLong}**`,
        color: 0x6FC8F0,
        fields: fields,
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = fortniteCommand;
