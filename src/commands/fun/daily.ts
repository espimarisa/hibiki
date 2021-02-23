import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { to24Hours } from "../../utils/format";

export class DailyCommand extends Command {
  description = "Gives you your daily amount of cookies.";
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    let cookies = await this.bot.db.getUserCookies(msg.author.id);
    if (!cookies) {
      await this.bot.db.insertBlankUserCookies(msg.author.id);

      cookies = {
        id: msg.author.id,
        amount: 0,
        lastclaim: null,
      };
    }

    if (new Date().getTime() - new Date(cookies.lastclaim).getTime() > 86400000) {
      const amount = cookies.amount + 100;

      cookies = {
        id: msg.author.id,
        amount: amount,
        lastclaim: new Date(),
      };

      // Updates DB
      await this.bot.db.updateUserCookies(msg.author.id, cookies);
      return msg.createEmbed(`🍪 ${msg.string("fun.DAILY")}`, msg.string("fun.DAILY_CLAIMED"));
    } else {
      const time = 86400000 - (new Date().getTime() - cookies.lastclaim.getTime());
      msg.createEmbed(`🍪 ${msg.string("fun.DAILY")}`, msg.string("fun.DAILY_COOLDOWN", { timeout: to24Hours(msg.string, time) }));
    }
  }
}
