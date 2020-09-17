const Command = require("../../structures/Command");
const format = require("../../utils/format");

class roleinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["rinfo"],
      args: "<role:role>",
      description: "Returns information about a role.",
    });
  }

  run(msg, args, pargs) {
    const role = pargs[0].value;
    let mems = 0;

    // Gets total members with the role
    msg.channel.guild.members.forEach(m => {
      if (m.roles.includes(role.id)) mems++;
    });

    // Role settings
    const settings = [];
    if (role.mentionable) settings.push("Mentionable");
    if (role.hoist) settings.push("Hoisted");
    if (role.managed) settings.push("Managed by an integration");

    // Fields to push
    const fields = [];
    fields.push({
      name: "ID",
      value: role.id,
      inline: true,
    });

    if (role.color !== 0) fields.push({
      name: "Color",
      value: `#${role.color.toString(16)}`,
      inline: true,
    });

    fields.push({
      name: "Created",
      value: `${format.date(role.createdAt)} (${format.dateParse(new Date() / 1000 - role.createdAt / 1000)} ago)`,
    });

    if (settings.length) fields.push({
      name: "Settings",
      value: `${settings.join(", ")}`,
    });

    fields.push({
      name: "Info",
      value: `${mems} members have the role, and it's in position ${role.position}.`,
    });

    msg.channel.createMessage({
      embed: {
        color: role.color === 0 ? this.bot.embed.color("general") : role.color,
        fields: fields,
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `@${role.name}`,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = roleinfoCommand;
