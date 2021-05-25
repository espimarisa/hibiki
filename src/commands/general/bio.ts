/**
 * @file Bio command
 * @description Sets the executor's bio or view your or another member's bio
 */

import type { Member, Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";
import { fullInviteRegex } from "../../utils/constants";

export class bioCommand extends Command {
  description = "Sets your bio or views your or another member's bio.";
  args = "[bio:string] | [member:member]";

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Shows other member's bios
    if (args.join(" ").length) {
      const member = this.bot.args.argtypes.member(args.join(" "), msg, ["strict"]) as Member;
      if (member) {
        const userconfig = await this.bot.db.getUserConfig(member.id);
        return userconfig?.bio
          ? msg.createEmbed(
              `👤 ${msg.string("global.BIO")}`,
              msg.string("general.BIO_MEMBER", { member: member.username, bio: userconfig.bio }),
            )
          : msg.createEmbed(msg.string("global.ERROR"), msg.string("general.BIO_MEMBER_DOESNTHAVE", { member: member.username }), "error");
      }
    }

    // Bio limit
    if (args.join(" ").length > 200) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.BIO_TOOLONG"), "error");
    }

    let userconfig = await this.bot.db.getUserConfig(msg.author.id);

    // No bio set; no args
    if (!args.length && !userconfig?.bio) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.BIO_DIDNTPROVIDE"), "error");
    }

    // Shows the bio
    else if (!args.length && userconfig?.bio) {
      return msg.createEmbed(`👤 ${msg.string("global.BIO")}`, msg.string("general.BIO_SHOW", { bio: userconfig.bio }));
    }

    // Bio deletion
    if (["clear", "delete", "remove"].includes(args?.[0]?.toLowerCase())) {
      delete userconfig.bio;
      await this.bot.db.updateUserConfig(msg.author.id, userconfig);
      return msg.createEmbed(msg.string("global.SUCCESS"), msg.string("general.BIO_CLEARED"), "success");
    }

    if (!userconfig?.bio) {
      userconfig = { id: msg.author.id };
      await this.bot.db.insertBlankUserConfig(msg.author.id);
    }

    // Sets bio; blocks ads
    userconfig.bio = args.join(" ");
    if (fullInviteRegex.test(userconfig.bio)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.BIO_ADVERTISEMENT"), "error");
    }

    // Updates userconfig
    await this.bot.db.updateUserConfig(msg.author.id, userconfig);
    msg.createEmbed(msg.string("global.SUCCESS"), msg.string("general.BIO_SET", { bio: args.join(" ") }), "success");
  }
}
