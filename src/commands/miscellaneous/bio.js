const Command = require("../../structures/Command");

class bioCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["addbio", "clearbio", "removebio", "rmbio", "userbio"],
      args: "[bio:string] [clear:string] [member:member]",
      description: "Sets a custom bio to display on your profile.",
    });
  }

  async run(msg, args) {
    // Other user's bios
    const user = this.bot.args.argtypes.member(args.join(" "), msg);
    if (user) {
      const cfg = await this.bot.db.table("userconfig").get(user.id).run();
      return cfg && cfg.bio ?
        this.bot.embed("👤 Bio", `**${user.username}**'s bio is \`${cfg.bio}\`.`, msg) :
        this.bot.embed("❌ Error", `**${user.username}** doesn't have a bio.`, msg, "error");
    }

    // Bio limit
    if (args.join(" ").length > 120) return this.bot.embed("❌ Error", "Max bio length is 120.", msg, "error");
    let cfg = await this.bot.db.table("userconfig").get(msg.author.id).run();
    if (!args.length && (!cfg || !cfg.bio)) return this.bot.embed("❌ Error", "You didn't provide a bio.", msg, "error");

    // Shows the bio
    else if (!args.length && cfg && cfg.bio) return this.bot.embed("👤 Bio", `Your bio is currently \`${cfg.bio}\`.`, msg);
    if (!cfg) { cfg = { id: msg.author.id, bio: null }; }
    await this.bot.db.table("userconfig").insert(cfg).run();

    // Bio clearing
    if (["clear", "delete", "remove"].includes(args.join(" ").toLowerCase())) {
      cfg.bio = null;
      await this.bot.db.table("userconfig").get(msg.author.id).update(cfg).run();
      return this.bot.embed("👤 Bio", "Your bio has been cleared.", msg);
    }

    // Sets bio; blocks ads
    cfg.bio = args.join(" ");
    if (/(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|list)|discord(app)?\.com\/invite)\/.+[a-z]/.test(cfg.bio)) {
      return this.bot.embed("❌ Error", "Your bio included an advertisement.", msg, "error");
    }

    // Updates userconfig
    await this.bot.db.table("userconfig").get(msg.author.id).update(cfg).run();
    this.bot.embed("👤 Bio", `Your bio was set to \`${cfg.bio}\`.`, msg);
  }
}

module.exports = bioCommand;
