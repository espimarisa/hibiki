const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class serverCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guild", "guildinfo", "serverinfo"],
      description: "Returns info about the server.",
    });
  }

  run(msg, args) {
    let guild = msg.channel.guild;
    // Lets owners show other server info
    if (args[0] && this.bot.cfg.owners.includes(msg.author.id)) {
      guild = this.bot.guilds.find(g => g.name.toLowerCase().startsWith(args.join(" ")) || g.id === args.join(" "));
    } else guild = msg.channel.guild;
    if (!guild) return msg.channel.guild;
    // Seperates bots & members
    let bots = 0;
    let users = 0;
    guild.members.forEach(mem => {
      if (mem.bot) bots++;
      else users++;
    });

    // Sets the description
    const desc = [];
    desc.push({ name: "👑", value: `Owned by ${format.tag(guild.members.find(mem => mem.id === guild.ownerID))}` });
    desc.push({ name: "🆔", value: `${guild.id}` });
    desc.push({ name: "📅", value: `Created ${format.date(guild.createdAt)}` });
    desc.push({ name: "", value: `${format.region(guild.region)} region` });
    desc.push({ name: "👥", value: `${users} members, ${bots} bots` });
    desc.push({ name: "📚", value: `${guild.roles.size} roles` });
    desc.push({ name: "💬", value: `${guild.channels.size} channels` });
    if (guild.emojis.length) desc.push({ name: "😃", value: `${guild.emojis.length} emojis` });
    if (guild.explicitContentFilter > 0) desc.push({ name: "🗑", value: `Filter level ${guild.explicitContentFilter}` });
    if (guild.verificationLevel > 0) desc.push({ name: "🔐", value: `Verification level ${guild.verificationLevel}` });
    if (guild.mfaLevel === 1) desc.push({ name: "🔐", value: "2FA Enabled" });
    if (guild.defaultNotifications === 0) desc.push({ name: "🔔", value: "All messages notify" });
    if (guild.premiumSubscriptionCount > 0) desc.push({ name: "👤", value: `${guild.premiumSubscriptionCount} members boosting` });
    if (guild.premiumTier > 0) desc.push({ name: "⭐", value: `Boost level ${guild.premiumTier}` });

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        description: desc.map(d => `${d.name} ${d.value}`).join("\n"),
        color: this.bot.embed.color("general"),
        author: {
          icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: guild.name,
        },
        thumbnail: {
          url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
        },
      },
    });
  }
}

module.exports = serverCommand;
