import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class SetAssignableCommand extends Command {
  description = "Sets one or more roles to be able to be self-assigned.";
  clientperms = ["manageRoles"];
  requiredperms = ["manageRoles"];
  args = "<role:role>";
  aliases = ["addassign", "addassignable", "addassignablerole", "makeassign", "makeassignable", "setassign", "setassignable"];
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const roles: string[] = [];
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig) {
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);
      guildconfig = { id: msg.channel.guild.id };
    }

    // Tries to push each role
    args
      .join(" ")
      .split(/(?:\s{0,},\s{0,})|\s/)
      .forEach(async (arg: string) => {
        const role = this.bot.args.argtypes.role(arg, msg);
        if (!role) return;
        if (!guildconfig?.assignableRoles?.length) guildconfig.assignableRoles = [];
        if (guildconfig?.assignableRoles?.includes?.(role.id)) return;

        // Adds the role to the guildconfig
        guildconfig.assignableRoles?.push?.(role.id);
        roles.push(role.name);
      });

    // If no roles were added; finds failed roles
    if (!roles.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("general.ASSIGN_NOROLES"), "error");

    // Updates the guildconfig
    await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);

    // Sends added roles
    msg.channel.createMessage({
      embed: {
        title: msg.locale("global.SUCCESS"),
        description: msg.locale("moderation.SETASSIGNABLE_SET", {
          roles: roles.map((a) => `\`${a}\``).join(", "),
          amount: roles.length,
        }),
        color: msg.convertHex("success"),
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
