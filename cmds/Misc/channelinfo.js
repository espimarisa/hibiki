const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class channelinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cinfo"],
      args: "<channel:channel>",
      description: "Returns information about a channel.",
      cooldown: 3,
    });
  }

  run(msg, args, pargs) {
    const channel = pargs[0].value;
    // Categories
    if (channel.type === 4) return msg.channel.createMessage(this.bot.embed("❌ Error", "A category was provided, not a channel.", "error"));
    // Sets the description
    const desc = [];
    if (channel.topic) desc.push({ name: "", value: `${channel.topic}` });
    if (channel.parentID) desc.push({ name: "📰", value: `${msg.channel.guild.channels.get(channel.parentID).name} category` });
    desc.push({ name: "📅", value: `${format.date(channel.createdAt)} (${format.dateParse(new Date() / 1000 - channel.createdAt / 1000)} ago)` });
    desc.push({ name: "🆔", value: channel.id });
    if (channel.type === 0) desc.push({ name: "📝", value: `Channel ${channel.nsfw ? "is" : "isn't"} NSFW; position ${channel.position}.` });
    if (channel.type === 2) desc.push({ name: "📝", value: `Bitrate: ${channel.bitrate}; limited to ${channel.userLimit} users` });
    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(d => `${d.name} ${d.value}`).join("\n"),
        color: this.bot.embed.color("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `#${channel.name} (${channel.type === 0 ? "text" : "voice"} channel)`,
        },
      },
    });
  }
}

module.exports = channelinfoCommand;
