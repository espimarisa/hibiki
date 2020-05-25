const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");
const fetch = require("node-fetch");

class warningsCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["punishments", "strikes", "warns", "warnings"],
      args: "<member:member&fallback>",
      description: "Shows what warnings a member has.",
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const warnings = await this.bot.db.table("warnings").filter({
      receiver: user.id,
      guild: msg.channel.guild.id,
    });

    if (!warnings.length) return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** has no warnings.`, "error"));
    // Uploads to hasteb.in if over 20
    if (warnings.length > 20) {
      const warnstring = `${warnings.map(m => `${m.id} (by ${format.tag(msg.channel.guild.members.get(m.giver) || { username: `Unknown User (${m.giverId})`, discriminator: "0000" })})\n${m.reason}`).join("\n\n")}`;
      const body = await fetch("https://hasteb.in/documents", { referrer: "https://hasteb.in/", body: warnstring, method: "POST", mode: "cors" })
        .then(async res => await res.json().catch(() => {}));
      return msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** has more than 20 warnings. View them [here](https://hasteb.in/${body.key}).`, "error"));
    }

    await msg.channel.createMessage({
      embed: {
        title: `⚠ ${user.username} has ${warnings.length} warning${warnings.length === 1 ? "" : "s"}.`,
        color: this.bot.embed.color("general"),
        fields: warnings.map(m => ({
          name: `${m.id} - from **${msg.channel.guild.members.get(m.giver) ? msg.channel.guild.members.get(m.giver).username : m.giver}**`,
          value: `${m.reason.slice(0, 150) || "No reason given."}`,
        })),
      },
    });
  }
}

module.exports = warningsCommand;
