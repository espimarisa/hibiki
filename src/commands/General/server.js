const Command = require("../../lib/structures/Command");

class servercmd extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guild", "guildinfo", "serverinfo"],
      cooldown: 3,
    });
  }

  async run(msg) {
    // Seperates bots & members
    let bots = 0;
    let users = 0;
    await msg.channel.guild.members.forEach(mem => {
      if (mem.bot == true) bots++;
      else users++;
    });

    // Seperates voice and text channels
    let voice = 0;
    let text = 0;
    await msg.channel.guild.channels.forEach(chan => {
      if (chan.type === 0) text++;
      if (chan.type === 2) voice++;
    });

    // Sets channels string
    let channels = `${text} text, ${voice} voice`;

    // Sets the description
    let desc = [{
      name: "👥",
      value: `**${users || "0"}** members`,
    }, {
      name: "🤖",
      value: `**${bots || "0"}** bots`,
    }, {
      name: "▶",
      value: `**${msg.channel.guild.roles.size}** roles`,
    }, {
      name: "😃",
      value: `**${msg.channel.guild.emojis.length}** emojis`
    }, {
      name: "🌍",
      value: `**${msg.channel.guild.region}**`,
    }, {
      name: "💬",
      value: `**${channels}, ${msg.channel.guild.channels.size}** channels`,
    }, {
      name: "📅",
      value: `**${new Date(msg.channel.guild.createdAt).toUTCString()}**`,
    }, {
      name: "🆔",
      value: `**${msg.channel.guild.id}**`,
    }]

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        thumbnail: {
          url: msg.channel.guild.iconURL || "",
        },
        title: `💬 ${msg.channel.guild.name}`,
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
      }
    })
  }
}

module.exports = servercmd;
