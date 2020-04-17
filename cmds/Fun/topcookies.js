const Command = require("../../lib/structures/Command");

class topcookiesCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cookieleaderboard", "leaderboard"],
      description: "Shows the 10 members with the most cookies.",
    });
  }

  async run(msg) {
    // Reads the DB
    const cookies = await this.bot.db.table("economy");
    let leaderboardcookies = [];
    // Sorts the cookie amount/userID
    Object.values(cookies).forEach(cookie => {
      leaderboardcookies.push([cookie.amount, cookie.id]);
    });

    // Sorts the top 10 users
    leaderboardcookies.sort((a, b) => b[0] - a[0]);
    let content = "";
    let place = 1;

    // Looks for each user
    leaderboardcookies.forEach(leaderboard => {
      // Finds top 10 users
      if (place > 10) return;
      let user = this.bot.users.find(o => o.id === leaderboard[1]);
      if (!user) return;
      // Sets the message content
      content = `${content}\n**${place}.** ${user.username} **(${Math.floor(leaderboard[0])})**`;
      place += 1;
    });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: "🍪 Top Cookies",
        description: content,
        color: this.bot.embed.colour("general"),
      },
    });
  }
}

module.exports = topcookiesCommand;
