const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");
const fetch = require("node-fetch");

class pointsCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<user:member&fallback>",
      aliases: ["merits", "points", "reps", "reputation"],
      description: "Shows what reputation points a user has.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    // Looks for points
    const points = await this.bot.db.table("points").filter({
      receiver: user.id,
      guild: msg.channel.guild.id,
    });

    // If user has no points
    if (!points.length) return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** has no reputation points.`, "error"));
    // Uploads to hasteb.in if over 20
    if (points.length > 20) {
      // Joins points
      const pointstring = `${points.map(m => `${m.id} (by ${format.tag(msg.channel.guild.members.get(m.giver) || { username: `Unknown User (${m.giverId})`, discriminator: "0000" }, false)})\n${m.reason}`).join("\n\n")}`;
      const res = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in/", body: pointstring, method: "POST", mode: "cors" });
      const { key } = await res.json();
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** has more than 20 points. You can view them [here](https://hasteb.in/${key}).`, "error"));
    }

    // Sends the embed
    await msg.channel.createMessage({
      embed: {
        title: `✨ ${user.username} has ${points.length} point${points.length === 1 ? "" : "s"}.`,
        color: this.bot.embed.colour("general"),
        fields: points.map(m => ({
          name: `${m.id} - from **${msg.channel.guild.members.get(m.giver) ? msg.channel.guild.members.get(m.giver).username : m.giver}**`,
          value: `${m.reason.slice(0, 150) || "No reason provided"}`,
        })),
      },
    });
  }
}

module.exports = pointsCommand;
