const Command = require("structures/Command");

class prefixCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[prefix:string]",
      descriptiom: "Views or changes the bot's prefix.",
      allowdisable: false,
    });
  }

  async run(msg, args) {
    // Looks for custom prefix
    const prefix = args.join(" ").trim();
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (!args.length && (!guildcfg || !guildcfg.prefix)) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.config.prefixes[0],
      });
      return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${this.bot.config.prefixes[0]}\`.`));
    }

    // If there's a prefix & no args
    if (!args.length) return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${guildcfg.prefix}\`.`));

    // If there's no prefix, insert blank data
    if (!guildcfg || !guildcfg.prefix) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.config.prefixes[0],
      });
    }

    if (prefix.length > 15) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid prefix. The max length is 15.", "error"));
    // Lets members without permission check but not set
    if (!msg.member.permission.has("manageGuild")) return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have permission to set the prefix.", "error"));

    // Updates DB
    await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update({
      id: msg.channel.guild.id,
      prefix: prefix,
    });

    this.bot.emit("prefixUpdate", msg.channel.guild, msg.member, prefix);
    msg.channel.createMessage(this.bot.embed("✅ Success", `The prefix was set to \`${prefix}\`.`, "success"));
  }
}

module.exports = prefixCommand;
