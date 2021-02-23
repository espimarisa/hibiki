const Command = require("../../structures/Command");
const format = require("../../utils/format");

class serverCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guild", "guildinfo", "serverinfo"],
      description: "Returns info about the server.",
    });
  }

  run(msg, args) {
    // Lets owners show other server info
    let guild = msg.channel.guild;
    (args[0] && this.bot.config.owners.includes(msg.author.id)) ?
    guild = this.bot.guilds.find(g => g.name.toLowerCase().startsWith(args.join(" ")) || g.id === args.join(" ")) : guild = msg.channel.guild;
    if (!guild) return msg.channel.guild;

    let bots = 0;
    let members = 0;
    let voice = 0;
    let text = 0;

    // Seperates bots & humans
    guild.members.forEach(mem => {
      if (mem.bot) bots++;
      else members++;
    });

    // Seperates voice & text
    guild.channels.forEach(chan => {
      if (chan.type === 0) text++;
      if (chan.type === 2) voice++;
    });

    // Embed fields
    const fields = [];
    fields.push({
      name: "ID",
      value: guild.id,
    });

    fields.push({
      name: "Created",
      value: format.date(guild.createdAt),
    });

    fields.push({
      name: "Owner",
      value: `${this.bot.tag(guild.members.find(mem => mem.id === guild.ownerID))}`,
      inline: true,
    });

    fields.push({
      name: "Region",
      value: `${format.region(guild.region)}`,
      inline: true,
    });

    fields.push({
      name: "Members",
      value: `${members} ${members === 1 ? "member" : "members"}${bots > 0 ? `, ${bots} bot${bots === 1 ? "" : "s"}` : ""}`,
      inline: true,
    });

    fields.push({
      name: "Channels",
      value: `${text} text${voice > 0 ? `, ${voice} voice` : ""}`,
      inline: true,
    });

    fields.push({
      name: "Roles",
      value: guild.roles.size,
      inline: true,
    });

    if (guild.emojis.length) fields.push({
      name: "Emojis",
      value: guild.emojis.length,
      inline: true,
    });

    if (guild.explicitContentFilter > 0) fields.push({
      name: "Message Filter",
      value: `Level ${guild.explicitContentFilter}`,
      inline: true,
    });

    if (guild.verificationLevel > 0) fields.push({
      name: "Verification",
      value: `Level ${guild.verificationLevel}`,
      inline: true,
    });

    if (guild.mfaLevel === 1) fields.push({
      name: "2FA",
      value: "Enabled",
      inline: true,
    });

    if (guild.defaultNotifications === 0) fields.push({
      name: "Notifications",
      value: "All messages",
      inline: true,
    });

    if (guild.premiumSubscriptionCount > 0) fields.push({
      name: "Boosters",
      value: guild.premiumSubscriptionCount,
      inline: true,
    });

    if (guild.premiumTier > 0) fields.push({
      name: "Boost Level",
      value: guild.premiumTier,
      inline: true,
    });

    if (guild.features.length) fields.push({
      name: "Server Features",
      value: format.features(guild.features).join(", "),
      inline: false,
    });

    msg.channel.createMessage({
      embed: {
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
          name: guild.name,
        },
        thumbnail: {
          url: guild.iconURL || "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = serverCommand;
