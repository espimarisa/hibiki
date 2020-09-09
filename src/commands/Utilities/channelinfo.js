const Command = require("../../structures/Command");
const format = require("../../utils/format");

class channelinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cinfo"],
      args: "<channel:channel>",
      description: "Returns information about a channel.",
    });
  }

  run(msg, args, pargs) {
    const channel = pargs[0].value;
    if (channel.type === 4) return this.bot.embed("❌ Error", "No **channel** was provided.", msg, "error");

    const fields = [];
    fields.push({
      name: "ID",
      value: channel.id,
    });

    if (channel.parentID) fields.push({
      name: "Category",
      value: `${msg.channel.guild.channels.get(channel.parentID).name}`,
    });

    if (channel.topic) fields.push({
      name: "Topic",
      value: `${channel.topic}`,
    });

    fields.push({
      name: "Created",
      value: `${format.date(channel.createdAt)} (${format.dateParse(new Date() / 1000 - channel.createdAt / 1000)} ago)`,
    });

    if (channel.type === 0) fields.push({
      name: "Info",
      value: `The channel ${channel.nsfw ? "is" : "isn't"} NSFW and is in position ${channel.position}.`,
    });

    if (channel.type === 2) fields.push({
      name: "Info",
      value: `The channel's bitrate is ${channel.bitrate / 1000}kbps and it's limited to ${channel.userLimit > 0 ? `${channel.userLimit}` : "infinite"} users.`,
    });

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `#${channel.name} (${channel.type === 0 ? "text" : "voice"} channel)`,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = channelinfoCommand;
