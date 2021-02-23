import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class PayCommand extends Command {
  description = "Gives another member some of your cookies.";
  aliases = ["give", "givecookies"];
  args = "<member:member> <amount:number>";

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;
    const amount = parseInt(pargs[1].value);

    // Invalid member or amount
    if (member.bot) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.PAY_BOT"), "error");
    if (!amount || isNaN(amount) || amount < 0) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.PAY_INVALID"), "error");

    // Gets cookies
    let memberCookies = await this.bot.db.getUserCookies(member.user.id);
    let authorCookies = await this.bot.db.getUserCookies(msg.author.id);

    if (!memberCookies) {
      await this.bot.db.insertBlankUserCookies(member.user.id);
      memberCookies = await this.bot.db.getUserCookies(member.user.id);
    }

    if (!authorCookies) {
      await this.bot.db.insertBlankUserCookies(msg.author.id);
      authorCookies = await this.bot.db.getUserCookies(msg.author.id);
    }

    if (!authorCookies || amount > authorCookies?.amount || authorCookies?.amount <= 0) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.PAY_NOTENOUGH"), "error");
    }

    // Sets the amount
    memberCookies.amount += amount;
    authorCookies.amount -= amount;

    // Updates cookie amounts
    await this.bot.db.updateUserCookies(msg.author.id, authorCookies);
    await this.bot.db.updateUserCookies(member.user.id, memberCookies);
    msg.createEmbed(`🍪 ${msg.string("fun.PAY")}`, msg.string("fun.PAY_PAYED", { amount: amount, receiver: member.user.username }));
  }
}
