const Command = require("../../lib/structures/Command");

class configCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cfg", "guildcfg", "setup"],
      description: "Displays the server's config.",
      allowdisable: false,
    });
  }

  async run(msg) {
    let guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
    const settings = require("../../ext/dash/static/items");

    // If blank cfg
    if (!guildcfg) {
      await this.bot.db.table("guildcfg").insert({ id: msg.channel.guild.id });
      guildcfg = { id: msg.channel.guild.id };
    }

    // Invite & spam punishments
    if (!guildcfg.invitePunishments) guildcfg.invitePunishments = [];
    if (!guildcfg.spamPunishments) guildcfg.spamPunishments = [];

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🔧 Config",
        description: `Editing the config has moved to the [web dashboard](${this.bot.cfg.homepage}).`,
        color: this.bot.embed.colour("general"),
        // Sends server config
        fields: settings.filter(f => f.id || guildcfg[f.id]).sort((a, b) => a.id > b.id ? 1 : -1).map(s => {
          let sid = guildcfg[s.id];
          if (s.type === "channelID" && guildcfg[s.id]) sid = `<#${guildcfg[s.id]}>`;
          else if (s.type === "roleID" && guildcfg[s.id]) sid = `<@&${guildcfg[s.id]}>`;
          else if (s.type === "roleArray" && guildcfg[s.id]) sid = guildcfg[s.id].map(r => `<@&${r}>`).join(", ");
          else if (s.type === "punishment") sid = guildcfg[s.id].join(", ");
          else if (s.type === "array" && guildcfg[s.id]) sid = guildcfg[s.id].map(c => `${c}`).join(", ");
          if (sid)
            return {
              name: s.label || s.id,
              value: sid,
              inline: true,
            };
        }).filter(s => s),
      },
    });
  }
}

module.exports = configCommand;
