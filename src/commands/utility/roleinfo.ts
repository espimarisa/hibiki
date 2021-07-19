import type { Message, Role, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../utils/constants";
import { dateFormat } from "../../utils/format";

export class RoleinfoCommand extends Command {
  description = "Gets information for a role.";
  args = "<role:role>";
  aliases = ["rinfo"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const role = pargs[0].value as Role;
    const fields = [];
    let membersWithRole = 0;

    // Gets total members with the role
    msg.channel.guild.members.forEach((m) => {
      if (m.roles.includes(role.id)) membersWithRole++;
    });

    // Role settings
    const settings = [];
    if (role.mentionable) settings.push(msg.locale("utility.ROLEINFO_MENTIONABLE"));
    if (role.hoist) settings.push(msg.locale("utility.ROLEINFO_HOISTED"));
    if (role.managed) settings.push(msg.locale("utility.ROLEINFO_MANAGED"));

    // Fields to push
    fields.push({
      name: msg.locale("global.ID"),
      value: role.id,
      inline: true,
    });

    if (role.color !== 0)
      fields.push({
        name: msg.locale("global.COLOR"),
        value: `#${role.color.toString(16)}`,
        inline: true,
      });

    fields.push({
      name: msg.locale("global.CREATED"),
      value: `${dateFormat(role.createdAt, msg.locale)}`,
    });

    if (settings.length)
      fields.push({
        name: msg.locale("global.SETTINGS"),
        value: `${settings.join(", ")}`,
      });

    fields.push({
      name: msg.locale("global.INFO"),
      value: `${msg.locale("utility.ROLEINFO_INFO", {
        members: membersWithRole,
        position: role.position,
      })}`,
    });

    msg.channel.createMessage({
      embed: {
        color: role.color === 0 ? msg.convertHex("general") : role.color,
        fields: fields,
        author: {
          icon_url: msg.channel.guild.iconURL || `${defaultAvatar}`,
          name: `@${role.name}`,
        },
        footer: {
          text: `${msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
