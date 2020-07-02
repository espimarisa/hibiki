const Command = require("../../structures/Command");

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
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();

    if (!args.length && (!guildcfg || !guildcfg.prefix)) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.config.prefixes[0],
      }).run();
      return this.bot.embed("🤖 Prefix", `The prefix in this server is \`${this.bot.config.prefixes[0]}\`.`, msg);
    }

    // If there's a prefix & no args
    if (!args.length) return this.bot.embed("🤖 Prefix", `The prefix in this server is \`${guildcfg.prefix}\`.`, msg);

    // If no guildcfg
    if (!guildcfg || !guildcfg.prefix) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.config.prefixes[0],
      }).run();
    }

    if (prefix.length > 15) return this.bot.embed("❌ Error", "The max prefix length is 15 characters.", msg, "error");

    // Lets members without permission check but not set
    if (!msg.member.permission.has("manageGuild")) {
      return this.bot.embed("❌ Error", "You don't have permission to set the prefix.", msg, "error");
    }

    // Updates DB
    await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update({
      id: msg.channel.guild.id,
      prefix: prefix,
    }).run();

    this.bot.emit("prefixUpdate", msg.channel.guild, msg.member, prefix);
    this.bot.embed("✅ Success", `The prefix was set to \`${prefix}\`.`, msg, "success");
  }
}

module.exports = prefixCommand;
