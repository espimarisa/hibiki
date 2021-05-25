/**
 * @file Avatar command
 * @description Sends executor's or provided member's profile picture
 */

import type { Member, Message, TextChannel } from "eris";

import { User } from "eris";

import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../utils/constants";

export class AvatarCommand extends Command {
  args = "<member:member&fallback,userFallback>";
  aliases = ["pfp", "profilepic", "profilepicture", "uicon", "usericon"];
  description = "Sends your (or the provided member's) profile picture.";

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    let member = (await pargs[0].value) as Member;
    if (!member?.id) member = msg.member;
    const user = member instanceof User;
    let fallbackAvatar: string;
    let fallbackTag: string;

    // User is not in guild
    if (user) {
      if (!member.avatar) fallbackAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(member.discriminator) % 5}.png`;
      else fallbackAvatar = `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=512`;
      fallbackTag = `${member.username}#${member.discriminator}`;
    }

    // Sends the avatar
    msg.channel.createMessage({
      embed: {
        color: msg.convertHex("general"),
        author: {
          icon_url: fallbackAvatar ?? (member.user.dynamicAvatarURL() || defaultAvatar),
          name: `${fallbackTag ?? msg.tagUser(member.user)}`,
        },
        image: {
          url: fallbackAvatar ?? (member.user.dynamicAvatarURL() || defaultAvatar),
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: user ? msg.string("general.USER_NOTINGUILD") : undefined,
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
