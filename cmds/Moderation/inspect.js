const Command = require("../../lib/structures/Command");

class inspectCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<invite:string>",
      aliases: ["lookup", "lookupinvite", "inspectinvite", "inviteinspect", "invitelookup"],
      description: "Returns info about a server invite.",
      staff: true,
    });
  }

  async run(msg, args) {
    // Invite parser
    let urlargs = args.join(" ").split(".gg/");
    if (!urlargs || !urlargs[1]) urlargs = args.join(" ").split("discordapp.com/invite/");
    // Invite info // todo - make this be a regex lol
    let invinfo = await this.bot.getInvite(args[0].startsWith("https://discord.gg") || args[0].startsWith("http://discord.gg") || args[0].startsWith("discord.gg") || args[0].startsWith("https://discordapp.com/invite/") || args[0].startsWith("http://discordapp.com/invite/") || args[0].startsWith("discordapp.com/invite/") ? urlargs[1] : args.join(" "), true);
    if (!invinfo) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid invite.", "error"));

    // Sets the description
    let fields = [];
    fields.push({ name: "Server ID", value: invinfo.guild.id });
    if (invinfo.channel) fields.push({ name: "Channel", value: `#${invinfo.channel.name} (${invinfo.channel.id})` });
    if (invinfo.inviter) fields.push({ name: "Inviter", value: `${invinfo.inviter !== undefined ? invinfo.inviter.username : "Widget"}${invinfo.inviter ? "#" : ""}${invinfo.inviter !== undefined ? invinfo.inviter.discriminator : ""} (${invinfo.inviter !== undefined ? invinfo.inviter.id : invinfo.guild.id})` })
    if (invinfo.memberCount) fields.push({ name: "Members", value: `${invinfo.memberCount} members, ${invinfo.presenceCount} currently online` })

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.colour("general"),
        fields: fields,
        author: {
          icon_url: invinfo.guild.icon !== undefined ? `https://cdn.discordapp.com/icons/${invinfo.guild.id}/${invinfo.guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `${invinfo.guild.name} (${invinfo.code})`,
        },
        thumbnail: {
          url: invinfo.guild.icon !== undefined ? `https://cdn.discordapp.com/icons/${invinfo.guild.id}/${invinfo.guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
        },
      },
    });
  }
}

module.exports = inspectCommand;
