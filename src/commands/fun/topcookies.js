const Command = require("../../structures/Command");

class topcookiesCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["cookieleaderboard", "leaderboard"],
      description: "Shows the 10 members with the most cookies.",
      allowdms: true,
    });
  }

  async run(msg) {
    const cookies = await this.bot.db.table("economy").run();
    const leaderboardcookies = [];
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
      if (leaderboard[0] === 0) return;
      const user = this.bot.users.find(o => o.id === leaderboard[1]);
      if (!user) return;
      // Sets the message content
      content = `${content}\n**${place}.** ${user.username} **(${Math.floor(leaderboard[0])})**`;
      place += 1;
    });

    if (!content) return this.bot.embed("❌ Error", "No members currently have cookies.", msg, "error");

    msg.channel.createMessage({
      embed: {
        title: "🍪 Cookie Leaderboard",
        description: content,
        color: this.bot.embed.color("general"),
      },
      footer: {
        text: `Ran by ${this.bot.tag(msg.author)}`,
        icon_url: msg.author.dynamicAvatarURL(),
      },
    });
  }
}

module.exports = topcookiesCommand;
