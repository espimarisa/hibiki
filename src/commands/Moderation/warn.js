const Command = require("../../lib/structures/Command");
const { Snowflake } = require("../../lib/utils/Snowflake");

class warnCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["punish", "s", "strike", "w", "warn"],
      args: "<member:member&strict> [reason:string]",
      description: "Gives a member a warning.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    // Generates the id
    const id = Snowflake();
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Inserts info
    await this.bot.db.table("warnings").insert({
      giver: msg.author.id,
      receiver: user.id,
      guild: msg.channel.guild.id,
      id: id,
      reason: reason || "No reason given.",
    });

    this.bot.emit("memberWarn", msg.channel.guild, msg.member, user, id, reason || "No reason given.");
    msg.channel.createMessage(this.bot.embed("⚠ Warn", `**${user.username}** was given a warning.`));
  }
}

module.exports = warnCommand;
