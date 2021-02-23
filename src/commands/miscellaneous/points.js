const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class pointsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["merits", "rep", "reps", "reputation"],
      args: "<member:member&fallback>",
      description: "Shows what reputation points a member has.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const points = await this.bot.db.table("points").filter({
      receiver: user.id,
      guild: msg.channel.guild.id,
    }).run();

    if (!points.length) return this.bot.embed("❌ Error", `**${user.username}** has no reputation points.`, msg, "error");

    // Uploads to hasteb.in if over 20
    if (points.length > 20) {
      const pointstring = `${points.map(p => `${p.id} (by ${this.bot.tag(msg.channel.guild.members.get(p.giver) ||
          { username: `Unknown User (${p.giverId})`, discriminator: "0000" })})\n${p.reason}`).join("\n\n")}`;

      const body = await fetch("https://hasteb.in/documents", {
        referrer: "https://hasteb.in/",
        body: pointstring,
        method: "POST",
        mode: "cors",
      }).then(res => res.json().catch(() => {}));

      return this.bot.embed(
        "❌ Error",
        `**${user.username}** has more than 20 points. View them [here](https://hasteb.in/${body.key}).`,
        msg,
        "error",
      );
    }

    msg.channel.createMessage({
      embed: {
        title: `✨ ${user.username} has ${points.length} point${points.length === 1 ? "" : "s"}.`,
        color: this.bot.embed.color("general"),
        fields: points.map(p => ({
          name: `${p.id} (from **${msg.channel.guild.members.get(p.giver) ? msg.channel.guild.members.get(p.giver).username : p.giver}**)`,
          value: `${p.reason.slice(0, 150) || "No reason provided."}`,
        })),
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = pointsCommand;
