const Command = require("structures/Command");
const { Snowflake } = require("utils/Snowflake");

class addpointCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addreputation", "addmerit", "addrep", "merit"],
      args: "<member:member&strict> [reason:string]",
      description: "Gives a member a reputation point.",
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
    await this.bot.db.table("points").insert({
      giver: msg.author.id,
      receiver: user.id,
      guild: msg.channel.guild.id,
      id: id,
      reason: reason || "No reason given.",
    }).run();

    this.bot.emit("pointAdd", msg.channel.guild, msg.member, user, id, reason || "No reason given.");
    this.bot.embed("✨ Point", `**${user.username}** was given a reputation point.`, msg);
  }
}

module.exports = addpointCommand;
