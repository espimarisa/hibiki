const Command = require("../../lib/structures/Command");

class prefixCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[prefix:string]",
      descriptiom: "Views or changes the bot's prefix.",
      allowdisable: false,
    });
  }

  async run(msg, args) {
    let prefix = args.join(" ").trim();
    // Looks for custom prefix
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    if (guildcfg.prefix === "") { guildcfg.prefix = this.bot.cfg.prefix; }
    // Inserts blank info
    if (!guildcfg) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.cfg.prefix,
      });
    }
    // Prefix over 15 chars
    if (prefix.length > 15) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid prefix. The max length is 15.", "error"));
    // Sends prefix if no args
    if (!prefix.length) return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${guildcfg.prefix && guildcfg !== undefined && guildcfg.prefix !== undefined || !guildcfg.prefix.length ? guildcfg.prefix : this.bot.cfg.prefix}\``));
    // Lets members without permission check but not set
    if (!msg.member.permission.has("manageGuild")) return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have permission to set the prefix.", "error"));

    // Updates DB
    await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update({
      id: msg.channel.guild.id,
      prefix: prefix,
    });
    // Sends embed
    msg.channel.createMessage(this.bot.embed("✅ Success", `The prefix was set to \`${prefix}\`.`, "success"));
  }
}

module.exports = prefixCommand;
