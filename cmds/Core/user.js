const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class userCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[user:member&fallback]",
      aliases: ["profile", "uinfo", "userinfo"],
      cooldown: 2,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const desc = [];
    // Finds user's game
    let playing = user.game && user.game.name.trim() ? user.game.name.trim() : "Nothing";
    // Custom statuses
    if (user.game && user.game.type === 4) {
      if (user.game.emoji && user.game.emoji.name && !user.game.emoji.id) playing = `${user.game.emoji.name} ${user.game.state || ""}`;
      else playing = user.game.state;
    }

    // Formats statuses
    function statusFormat(status) {
      switch (status) {
        case "online":
          return "🟢 Online";
        case "idle":
          return "🟡 Idle";
        case "dnd":
          return "🔴 Do Not Disturb";
        case "offline":
          return "⚪ Invisible/Offline";
        default:
          return status;
      }
    }

    // DB related
    let spouseid;
    let pointcount = 0;
    let warningcount = 0;
    const cookies = await this.bot.db.table("economy").get(user.id);
    const points = await this.bot.db.table("points");
    const usercfg = await this.bot.db.table("usercfg").get(user.id);
    const warnings = await this.bot.db.table("warnings");
    const [spouse] = await this.bot.db.table("marriages").getAll(user.id, { index: "marriages" });
    if (spouse) spouseid = spouse.id === user.id ? spouse.spouse : spouse.id;
    points.forEach(p => { if (p.guild === msg.channel.guild.id && p.receiver === user.id) pointcount++; });
    warnings.forEach(w => { if (w.guild === msg.channel.guild.id && w.receiver === user.id) warningcount++; });

    // Sets the description
    if (usercfg && usercfg.bio) desc.push({ name: "", value: `${usercfg.bio}` });
    if (user.nick) desc.push({ name: "📛", value: user.nick });
    desc.push({ name: "", value: statusFormat(user.status) });
    desc.push({ name: "📩", value: `Joined ${format.date(user.joinedAt)}` });
    desc.push({ name: "📅", value: `Created ${format.date(user.createdAt)}` });
    desc.push({ name: "🆔", value: user.id });
    if (user.roles.length) desc.push({ name: "🔢", value: `Top role is ${user.highestRole.name}` });
    if (user.game) desc.push({ name: `${user.game.emoji ? "" : "▶"}`, value: playing });
    if (usercfg && usercfg.info) desc.push(Object.keys(usercfg.info).map(k => `**${k}**: ${usercfg.info[k]}`).join("\n"));
    if (spouse) desc.push({ name: "💝", value: `Married to ${spouseid ? this.bot.users.find(m => m.id === spouseid) ? this.bot.users.find(m => m.id === spouseid).username : `<@!${spouseid}>` : "Nobody"}` });
    if (cookies && cookies.amount > 0) desc.push({ name: "🍪", value: `${Math.floor(cookies.amount)} cookies` });
    if (pointcount) desc.push({ name: "🌟", value: `${pointcount} points` });
    if (warningcount) desc.push({ name: "🛠", value: `${warningcount} warnings` });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(d => `${d.name} ${d.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: format.tag(user.user),
        },
        thumbnail: {
          url: user.user.dynamicAvatarURL(null),
        },
      },
    });
  }
}

module.exports = userCommand;
