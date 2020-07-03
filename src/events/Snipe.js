const Event = require("../structures/Event");

class Snipe extends Event {
  constructor(...args) {
    super(...args, {
      name: "messageDelete",
    });
  }

  async run(msg) {
    if (!msg || !msg.channel || !msg.channel.guild || msg.author.bot) return;
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();
    if (guildcfg) {
      if (!guildcfg.snipingEnable) return;
      if ((!msg.attachments || msg.attachments[0] === undefined) && (!msg.content || !msg)) return;
      if (!guildcfg.snipingInvites && /(https?:\/\/)?(www\.)?(discord\.(gg|io|me|li|list)|discord(app)?\.com\/invite)\/.+[a-z]/.test(msg.content)) {
        return;
      }

      let ignored;
      guildcfg.snipingIgnore.forEach(c => {
        if (c && msg.channel.id === c && msg.channel.guild.channels.has(c)) ignored = true;
      });

      if (ignored) return;
    }

    this.bot.sniped[msg.channel.id] = {
      id: msg.channel.id,
      content: msg.content,
      author: `${msg.author.username}#${msg.author.discriminator}`,
      authorpfp: msg.author.dynamicAvatarURL(null, 1024),
      timestamp: msg.timestamp,
      msgid: msg.id,
      attachment: msg.attachments[0] !== undefined && msg.attachments[0].proxy_url !== undefined ? msg.attachments[0].proxy_url : undefined,
    };
  }
}

module.exports = Snipe;
