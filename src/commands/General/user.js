const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class userCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[user:user&fallback]",
      aliases: ["profile", "uinfo", "userinfo"],
      cooldown: 2,
    });
  }

  async run(msg, args, pargs) {
    let user = pargs[0].value;
    let desc = [];
    // Finds user's game
    let playing = user.game && user.game.name.trim() ? user.game.name.trim() : "Nothing";
    // Custom statuses
    if (user.game && user.game.type === 4) {
      if (user.game.emoji && user.game.emoji.name && !user.game.emoji.id) playing = `${user.game.emoji.name} ${user.game.state || ""}`;
      else playing = user.game.state;
    }
    // Sets the description
    let usercfg = await this.bot.db.table("usercfg").get(msg.author.id);
    // Bio
    if (usercfg && usercfg.bio) desc.push({ name: "", value: `${usercfg.bio}` })
    if (user.nick) desc.push({ name: "📛", value: user.nick, });
    desc.push({ name: "📩", value: `Joined ${format.prettyDate(user.joinedAt)}`, });
    desc.push({ name: "✉", value: `Created ${format.prettyDate(user.createdAt)}`, });
    // Top role
    if (user.roles.length > 0) desc.push({ name: "📚", value: `Top role is ${user.roles.map(r => msg.guild.roles.get(r)).sort((a, b) => b.position - a.position)[0].name}`, })
    // Statuses
    desc.push({ name: "", value: format.status(user.status), });
    if (user.game) desc.push({ name: `${user.game.emoji ? "" : "▶"}`, value: playing, });
    desc.push({ name: "🆔", value: user.id, });
    // Custom fields
    if (usercfg && usercfg.info) desc.push(Object.keys(usercfg.info).map(k => `**${k}**: ${usercfg.info[k]}`).join("\n"));

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(t => typeof t == "object" ? `${t.name} ${t.value}` : t).join("\n"),
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: format.tag(user.user, false),
        },
        thumbnail: {
          url: user.user.dynamicAvatarURL(null),
        },
      }
    })
  }
}

module.exports = userCommand;
