import type { EmbedField, Invite, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar, discordOnlyInviteRegex } from "../../utils/constants";

export class InspectCommand extends Command {
  description = "Inspects a Discord invite's information.";
  args = "<invite:string>";
  aliases = ["inviteinspect", "invitelookup"];
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const parser = discordOnlyInviteRegex.exec(args.join(" "));
    const invinfo = ((await this.bot.getInvite(parser ? parser[6] : args.join(" "), true).catch(() => {})) as unknown) as Invite;

    // Sends if the invite is invalid
    if (!invinfo) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.INVALID_INVITE"), "error");

    // Embed fields
    const fields: EmbedField[] = [];

    // ID
    fields.push({
      name: msg.locale("global.ID"),
      value: invinfo.guild.id,
    });

    // Channel
    if (invinfo.channel)
      fields.push({
        name: msg.locale("global.CHANNEL"),
        value: `#${invinfo.channel.name} (${invinfo.channel.id})`,
      });

    // Inviter
    if (invinfo.inviter)
      fields.push({
        name: msg.locale("utility.INVITER"),
        value:
          `${invinfo.inviter ? invinfo.inviter.username : `${msg.locale("utility.WIDGET")}`}${invinfo.inviter ? "#" : ""}` +
          `${invinfo.inviter ? invinfo.inviter.discriminator : ""} (${invinfo.inviter ? invinfo.inviter.id : invinfo.guild.id})`,
      });

    // Member count
    if (invinfo.memberCount)
      fields.push({
        name: msg.locale("global.MEMBERS"),
        value: `${msg.locale("global.MEMBER_AMOUNT", { amount: invinfo.memberCount })}, ${msg.locale("utility.AMOUNT_ONLINE", {
          amount: invinfo.presenceCount,
        })}`,
      });

    msg.channel.createMessage({
      embed: {
        fields: fields,
        color: msg.convertHex("general"),
        author: {
          icon_url: invinfo.guild.dynamicIconURL() || defaultAvatar,
          name: `${invinfo.guild.name} (${invinfo.code})`,
        },
        thumbnail: {
          url: invinfo.guild.dynamicIconURL() || defaultAvatar,
        },
        image: {
          url: invinfo.guild.dynamicBannerURL(),
        },
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
