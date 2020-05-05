const Command = require("../../lib/structures/Command");

class inspectCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<invite:string>",
      aliases: ["lookup", "lookupinvite", "inspectinvite", "inviteinspect", "invitelookup"],
      description: "Returns info about a server invite.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Invite parser
    // todo - fix parser, api bitches
    // it worked fine before lol
    let urlargs = args.join(" ").split(".gg/");
    if (!urlargs || !urlargs[1]) urlargs = args.join(" ").split("discordapp.com/invite/");
    const parser = (/(https?:\/\/)?(www\.)?(discord\.(gg)|discordapp\.com\/invite)\/(.+[a-z])/).test();
    // Gets the invite info
    const invinfo = await this.bot.getInvite(args[0].startsWith(parser) ? urlargs[1] : args.join(" "), true).catch(() => {});
    if (!invinfo) return msg.channel.createMessage(this.bot.embed("❌ Error", "Invalid invite.", "error"));
    // Sets the description
    const fields = [];
    fields.push({ name: "Server ID", value: invinfo.guild.id });
    if (invinfo.channel) fields.push({ name: "Channel", value: `#${invinfo.channel.name} (${invinfo.channel.id})` });
    if (invinfo.inviter) fields.push({ name: "Inviter", value: `${invinfo.inviter ? invinfo.inviter.username : "Widget"}${invinfo.inviter ? "#" : ""}${invinfo.inviter ? invinfo.inviter.discriminator : ""} (${invinfo.inviter ? invinfo.inviter.id : invinfo.guild.id})` });
    if (invinfo.memberCount) fields.push({ name: "Members", value: `${invinfo.memberCount} members, ${invinfo.presenceCount} currently online` });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: invinfo.guild.icon ? `https://cdn.discordapp.com/icons/${invinfo.guild.id}/${invinfo.guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `${invinfo.guild.name} (${invinfo.code})`,
        },
        thumbnail: {
          url: invinfo.guild.icon ? `https://cdn.discordapp.com/icons/${invinfo.guild.id}/${invinfo.guild.icon}.png` : "https://cdn.discordapp.com/embed/avatars/0.png",
        },
      },
    });
  }
}

module.exports = inspectCommand;
