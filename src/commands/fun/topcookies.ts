/**
 * @file TopCookies command
 * @description Shows the 10 members with the most cookies
 */

import type { Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

export class TopcookiesCommand extends Command {
  description = "Shows the 10 members with the most cookies.";
  aliases = ["cookieleaderboard", "leaderboard"];
  allowdms = true;

  async run(msg: Message<TextChannel>) {
    const cookies = await this.bot.db.getAllCookies();

    const leaderboardcookies: (string | number)[][] = [];
    Object.values(cookies).forEach((cookie) => {
      leaderboardcookies.push([cookie.amount, cookie.id]);
    });

    // Sorts the top 10 users
    leaderboardcookies.sort((a, b) => (b[0] as number) - (a[0] as number));
    let content = "";
    let place = 1;

    // Looks for each user
    leaderboardcookies.forEach((leaderboard) => {
      // Finds top 10 users
      if (place > 10) return;
      if (leaderboard[0] === 0) return;
      const user = this.bot.users.find((u) => u?.id === leaderboard[1]);
      if (!user) return;
      // Sets the message content
      content = `${content}\n**${place}.** ${user.username} **(${Math.floor(leaderboard[0] as number)})**`;
      place += 1;
    });

    // If no members have cookies
    if (!content) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.COOKIE_LEADERBOARDNOMEMBERS"), "error");

    // Sends leaderboard
    msg.createEmbed(`🍪 ${msg.string("fun.COOKIE_LEADERBOARD")}`, content, "general");
  }
}
