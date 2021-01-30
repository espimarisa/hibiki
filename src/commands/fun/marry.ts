import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { askYesNo } from "../../utils/ask";
import { timeoutHandler } from "../../utils/waitFor";

export class MarryCommand extends Command {
  description = "Asks another member to marry you.";
  args = "<member:member>";
  aliases = ["propose"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const state = await this.bot.db.getMarriageState(msg.author.id, member.user.id);

    // If user is already married
    if (state.find((m) => m.id === member.id || m.spouse === member.id)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.MARRY_ALREADY_MARRIED"), "error");
    }

    // If mentioned user is married
    if (state.find((m) => m.id === member.id || m.spouse === member.id)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.MARRY_USER_MARRIED", { member: member.user.username }), "error");
    }

    // Sends confirmation message
    const marrymsg = await msg.createEmbed(
      `💝 ${msg.string("fun.MARRY")}`,
      msg.string("fun.MARRY_YN", { member: member.user.username, user: msg.author.username }),
    );

    // Asks for yes/no
    const { response } = await askYesNo(this.bot, msg.string, member.id, msg.channel.id).catch((err) =>
      timeoutHandler(err, marrymsg, msg.string),
    );

    // If marriage is cancelled
    if (response === false) {
      return marrymsg.editEmbed(`💝 ${msg.string("fun.MARRY")}`, msg.string("fun.MARRY_CANCELLED"));
    }

    // Marries the members
    await this.bot.db.insertUserMarriage(msg.author.id, member.id);
    msg.createEmbed(
      `💝 ${msg.string("fun.MARRY")}`,
      msg.string("fun.MARRY_MARRIED", {
        user: msg.author.username,
        member: member.user.username,
      }),
    );
  }
}
