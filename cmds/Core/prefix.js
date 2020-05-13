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
    // Looks for custom prefix
    const prefix = args.join(" ").trim();
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    // Inserts blank info
    if (!guildcfg && !args.length) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.cfg.prefix,
      });
      return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${this.bot.cfg.prefix}\`.`));
    }

    if (guildcfg && guildcfg.prefix.length && !args.length) {
      return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${guildcfg.prefix}\`.`));
    }

    if (guildcfg && !guildcfg.prefix || !guildcfg.prefix.length && !args.length) {
      return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${this.bot.cfg.prefix}\`.`));
    }

    // Inserts blank info
    if (args.length) {
      await this.bot.db.table("guildcfg").insert({
        id: msg.channel.guild.id,
        prefix: this.bot.cfg.prefix,
      });

      // Prefix over 15 chars
      if (prefix.length > 15) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid prefix. The max length is 15.", "error"));

      // Sends prefix if no args
      if (!prefix.length) {
        return msg.channel.createMessage(this.bot.embed("🤖 Prefix", `The prefix in this server is \`${guildcfg && guildcfg.prefix || !guildcfg.prefix ? guildcfg.prefix : this.bot.cfg.prefix}\`.`));
      }

      // Lets members without permission check but not set
      if (!msg.member.permission.has("manageGuild")) return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have permission to set the prefix.", "error"));

      // Updates DB
      await this.bot.db.table("guildcfg").get(msg.channel.guild.id).update({
        id: msg.channel.guild.id,
        prefix: prefix,
      });

      // Sends embed
      this.bot.emit("prefixUpdate", msg.channel.guild, msg.member, prefix);
      msg.channel.createMessage(this.bot.embed("✅ Success", `The prefix was set to \`${prefix}\`.`, "success"));
    }
  }
}

module.exports = prefixCommand;
