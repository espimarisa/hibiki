const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class serverCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guild", "guildinfo", "serverinfo"],
    });
  }

  async run(msg) {
    // Seperates bots & members
    let bots = 0;
    let users = 0;
    await msg.guild.members.forEach(mem => {
      if (mem.bot == true) bots++;
      else users++;
    });

    // Seperates voice and text channels
    let voice = 0;
    let text = 0;
    await msg.guild.channels.forEach(chan => {
      if (chan.type === 0) text++;
      if (chan.type === 2) voice++;
    });

    // Sets channels string
    let channels = `${text} text, ${voice} voice`;
    // Sets the description
    let desc = [{
      name: "👑",
      value: `Owned by ${format.tag(msg.guild.members.find(mem => mem.id == msg.guild.ownerID, false))}`,
    }, {
      name: "👥",
      value: `${users || "0"} members, ${bots} bots`,
    }, {
      name: "📚",
      value: `${msg.guild.roles.size} roles`,
    }, {
      name: "😃",
      value: `${msg.guild.emojis.length} emojis`
    }, {
      name: "🌐",
      value: `${format.region(msg.guild.region)}`,
    }, {
      name: "💬",
      value: `${channels}, ${msg.guild.channels.size} channels`,
    }, {
      name: "🗑",
      value: `${format.contentfilter(msg.guild.explicitContentFilter)}`,
    }, {
      name: "🔓",
      value: `${format.verificationlevel(msg.guild.verificationLevel)}`,
    }, {
      name: "🔐",
      value: `${format.mfaLevel(msg.guild.mfaLevel)}`
    }, {
      name: "🔔",
      value: format.notifsettings(msg.guild.defaultNotifications),
    }, {
      name: "🆔",
      value: `${msg.guild.id}`,
    }, {
      name: "📅",
      value: `Created on ${format.prettyDate(msg.guild.createdAt)}`,
    }]

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: msg.guild.iconURL || "",
          name: msg.guild.name,
        },
        thumbnail: {
          url: msg.guild.iconURL || "",
        },
      }
    })
  }
}

module.exports = serverCommand;
