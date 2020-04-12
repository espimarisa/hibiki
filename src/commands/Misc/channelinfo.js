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
    let channel = pargs[0].value;
    // Categories
    if (channel.type == 4) return msg.channel.createMessage(this.bot.embed("❌ Error", "A category was provided, not a channel.", "error"));
    let desc = [];
    // Sets the description
    if (channel.topic) desc.push({ name: "", value: `${channel.topic} \n`, });
    if (channel.parentID != undefined) desc.push({ name: "📰", value: `${msg.channel.guild.channels.get(channel.parentID).name} category`, });
    desc.push({ name: "📅", value: `${format.date(channel.createdAt)} (${format.dateParse(new Date() / 1000 - channel.createdAt / 1000)} ago)`, });
    desc.push({ name: "🆔", value: channel.id, });
    desc.push({ name: "📝", value: channel.type == 2 ? `The voice bitrate is ${channel.bitrate} and the channel is limited to ${channel.userLimit == 0 ? "infinite" : channel.userLimit} users.` : `The channel ${channel.nsfw == true ? "is" : "isn't"} NSFW, and it's in position ${channel.position}.`, });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `#${channel.name} (${channel.type == 0 ? "text" : "voice"} channel)`,
        },
      },
    });
  }
}

module.exports = channelinfoCommand;
