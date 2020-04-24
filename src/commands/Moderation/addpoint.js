const Command = require("../../lib/structures/Command");
const { Snowflake } = require("../../lib/utils/Snowflake");
const id = Snowflake();

class addpointCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<user:member&strict> [reason:string]",
      aliases: ["addreputation", "addmerit", "addrep", "merit"],
      description: "Gives a member a reputation point.",
      requiredPerms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (reason.length > 512) reason = reason.slice(0, 512);

    // Inserts info into the DB
    await this.bot.db.table("points").insert({
      giver: msg.author.id,
      receiver: user.id,
      guild: msg.channel.guild.id,
      id: id,
      reason: reason || "No reason given.",
    });

    // Sends the embed
    msg.channel.createMessage(this.bot.embed("✨ Point", `**${user.username}** was given a reputation point.`));
  }
}

module.exports = addpointCommand;
