const { Snowflake } = require("../../utils/snowflake");
const Command = require("../../structures/Command");

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
      reason: reason || "No reason provided.",
    }).run();

    // Tries to DM user about their warning
    const dmchannel = await user.user.getDMChannel().catch(() => {});

    if (dmchannel) {
      dmchannel.createMessage({
        embed: {
          title: `⚠ Warned in ${msg.channel.guild.name}`,
          description: `You were warned for ${reason ? `\`${reason}\`` : "no reason provided."}`,
          color: this.bot.embed.color("error"),
          footer: {
            text: `Warned by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      }).catch(() => {});
    }

    this.bot.emit("memberWarn", msg.channel.guild, msg.member, user, id, reason || "No reason provided.");
    this.bot.embed("✅ Success", `**${user.username}** was given a warning${reason.length ? ` for \`${reason}\`.` : "."}`, msg, "success");
  }
}

module.exports = warnCommand;
