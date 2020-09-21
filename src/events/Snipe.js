const Event = require("../structures/Event");

class Snipe extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageDelete",
    });
  }

  async run(msg) {
    if (!msg || !msg.channel || !msg.channel.guild || msg.author && msg.author.bot) return;
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();
    if (guildconfig) {
      if (guildconfig.snipingDisable) return;
      if ((!msg.attachments || msg.attachments[0] === undefined) && (!msg.content || !msg)) return;
      if (!guildconfig.snipingInvites && /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|list)|discord(app)?\.com\/invite)\/.+[a-z]/.test(msg.content)) {
        return;
      }

      let ignored;
      if (guildconfig && guildconfig.snipingIgnore) {
        guildconfig.snipingIgnore.forEach(c => {
          if (c && msg.channel.id === c && msg.channel.guild.channels.has(c)) ignored = true;
        });
      }

      if (ignored) return;
    }

    this.bot.snipeData[msg.channel.id] = {
      id: msg.channel.id,
      content: msg.content,
      author: msg.author ? `${msg.author.username}#${msg.author.discriminator}` : null,
      authorpfp: msg.author ? msg.author.dynamicAvatarURL(null, 1024) : null,
      timestamp: msg.timestamp,
      msgid: msg.id,
      attachment: msg && msg.attachments && msg.attachments[0] !== undefined && msg.attachments[0].proxy_url !== undefined ? msg.attachments[0].proxy_url : undefined,
    };
  }
}

module.exports = Snipe;
