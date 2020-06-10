const Command = require("structures/Command");
const format = require("utils/format");

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
    msg.channel.guild.members.forEach(m => {
      if (m.roles.includes(role.id)) mems++;
    });

    const desc = [];
    const settings = [];
    if (role.mentionable) settings.push("Mentionable");
    if (role.hoist) settings.push("Hoisted");
    if (role.managed) settings.push("Managed by an integration");
    if (role.color !== 0) desc.push({ name: "🖍", value: `#${role.color.toString(16)}` });
    if (settings) desc.push({ name: "⚙", value: `${settings.join(", ")}` });
    desc.push({ name: "📆", value: `${format.date(role.createdAt)} (${format.dateParse(new Date() / 1000 - role.createdAt / 1000)} ago)` });
    desc.push({ name: "📝", value: `${mems} members have this role, and it's in position ${role.position}` });
    desc.push({ name: "🆔", value: role.id });

    msg.channel.createMessage({
      embed: {
        description: desc.map(d => `${d.name} ${d.value}`).join("\n"),
        color: role.color === 0 ? this.bot.embed.color("general") : role.color,
        author: {
          icon_url: msg.channel.guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: `@${role.name}`,
        },
      },
    });
  }
}

module.exports = roleinfoCommand;
