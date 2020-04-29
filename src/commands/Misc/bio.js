const Command = require("../../lib/structures/Command");

class bioCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addbio", "custombio", "profilebio", "removebio", "rmbio", "userbio"],
      description: "Sets a custom bio to display on your profile.",
      cooldown: 2,
    });
  }

  async run(msg, args) {
    // Other user's bios
    const user = this.bot.argParser.argTypes.member(args.join(" "), msg);
    if (user) {
      const cfg = await this.bot.db.table("usercfg").get(user.id);
      return cfg && cfg.bio ?
        // Sends the bio
        msg.channel.createMessage(this.bot.embed("👤 Bio", `**${user.username}**'s bio is currently \`${cfg.bio}\`.`)) :
        msg.channel.createMessage(this.bot.embed("❌ Error", `**${user.username}** doesn't have a bio.`, "error"));
    }
    // Bio limit
    if (args.join(" ").length > 120) return msg.channel.createMessage(this.bot.embed("❌ Error", "Max bio length is 120.", "error"));
    let cfg = await this.bot.db.table("usercfg").get(msg.author.id);
    if (!args.length && (!cfg || !cfg.bio)) return msg.channel.createMessage(this.bot.embed("❌ Error", "You didn't provide a bio.", "error"));
    // Shows the bio if it exists & no args given
    else if (!args.length && cfg && cfg.bio) return msg.channel.createMessage(this.bot.embed("👤 Bio", `Your bio is currently \`${cfg.bio}\`.`));
    // Inserts blank usercfg
    if (!cfg) { cfg = { id: msg.author.id, bio: null }; }
    await this.bot.db.table("usercfg").insert(cfg);

    // Bio clearing
    if (["clear", "delete", "remove"].includes(args.join(" ").toLowerCase())) {
      cfg.bio = null;
      await this.bot.db.table("usercfg").get(msg.author.id).update(cfg);
      return msg.channel.createMessage(this.bot.embed("👤 Bio", "Your bio has been cleared."));
    }

    // Sets bio
    cfg.bio = args.join(" ");
    // Blocks discord ads
    if (/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|list)|discordapp\.com\/invite)\/.+[a-z]/.test(cfg.bio)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "Your bio included an advertisement.", "error"));
    }
    // Updates usercfg
    await this.bot.db.table("usercfg").get(msg.author.id).update(cfg);
    msg.channel.createMessage(this.bot.embed("👤 Bio", `Bio set to \`${cfg.bio}\``));
  }
}

module.exports = bioCommand;
