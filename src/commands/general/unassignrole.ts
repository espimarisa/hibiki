/**
 * @file Unassign role command
 * @description Removes a role from you that's set to be assignable
 */

import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { itemExists } from "../../utils/itemExists";

export class UnassignRoleCommand extends Command {
  description = "Removes a role from you that's set to be assignable.";
  clientperms = ["manageRoles"];
  args = "[role:role]";
  aliases = ["unassign", "removerole", "iamnot"];

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    // If no roles are set to be assigned
    if (!guildconfig?.assignableRoles?.length) {
      return msg.createEmbed(`📄 ${msg.locale("general.CONFIG_ASSIGNABLEROLES")}`, msg.locale("general.ASSIGN_NOTHINGSET"));
    }

    // Cleans up roles that no longer exist
    guildconfig.assignableRoles = (await itemExists(
      msg.channel.guild,
      "role",
      guildconfig.assignableRoles,
      this.bot.db,
      "assignableRoles",
    )) as string[];

    // List of assignable roles if no args given
    if (!args.length) {
      return msg.createEmbed(
        `📄 ${msg.locale("general.CONFIG_ASSIGNABLEROLES")}`,
        `${guildconfig.assignableRoles.map((role) => `\`${msg.channel.guild.roles.get(role)?.name || role}\``).join(",")}`,
      );
    }

    // Tries to remove each role
    let roles = await Promise.all(
      args
        .join(" ")
        .split(/(?:\s{0,},\s{0,})|\s/)
        .map(async (arg: string) => {
          const role = this.bot.args.argtypes.role(arg, msg);
          if (!role) return { added: false, role: undefined };
          if (!msg.member.roles?.includes(role.id)) return { added: false, role: role, doesntHave: true };
          if (!guildconfig.assignableRoles?.includes(role.id)) return { added: false, role: undefined };

          try {
            // Removes the role
            await msg.member.removeRole(role.id, "Un self-assigned");
            return { removed: true, role: role };
          } catch (err) {
            return { removed: false, role: role };
          }
        }),
    );

    // Finds roles that exist in args
    roles = roles.filter((role) => role.role !== undefined);

    // If no roles were removed
    if (!roles.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("general.ASSIGN_NOROLES"), "error");

    // If the member already has every role
    if (roles.every((r) => r.doesntHave === true)) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("global.ROLE_DOESNTHAVE", { amount: roles.length }), "error");
    }

    // finds failed roles
    if (!roles.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("general.ASSIGN_NOROLES"), "error");
    const failed = roles.filter((r) => r.removed === false);
    const removed = roles.filter((r) => r.removed === true);
    const failedField: EmbedField[] = [];

    if (failed.length) {
      failedField.push({
        name: msg.locale("general.UNASSIGN_FAILED"),
        value: failed.map((f) => `\`${f.role.name}\``).join(", "),
      });
    }

    // Sends added roles
    msg.channel.createMessage({
      embed: {
        title: msg.locale("global.SUCCESS"),
        description: msg.locale("general.UNASSIGN_UNASSIGNED", {
          amount: removed.length,
          roles: removed.map((r) => `\`${r.role.name}\``).join(", "),
        }),
        color: msg.convertHex("success"),
        fields: failedField,
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    this.bot.emit(
      "roleAssign",
      msg.channel.guild,
      msg.author,
      null,
      null,
      removed.map((r) => `${r.role.name}`),
    );
  }
}
