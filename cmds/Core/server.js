const Command = require("../../lib/structures/Command");
const format = require("../../lib/scripts/Format");

class serverCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["guild", "guildinfo", "serverinfo"],
      description: "Returns info about a server.",
      cooldown: 2,
    });
  }

  async run(msg, args) {
    let guild = msg.channel.guild;
    // Lets owners show other server info
    if (args[0] && this.bot.cfg.owners.includes(msg.author.id)) {
      guild = await this.bot.guilds.find(g => g.name.toLowerCase().startsWith(args.join(" ")) || g.id === args.join(" "));
    } else guild = msg.channel.guild;
    if (!guild) return msg.channel.guild;
    // Seperates bots & members
    let bots = 0;
    let users = 0;
    await guild.members.forEach(mem => {
      if (mem.bot) bots++;
      else users++;
    });

    // Formats server regions
    function regionFormat(region) {
      switch (region) {
        case "amsterdam":
          return ":flag_nl: Amsterdam";
        case "brazil":
          return ":flag_br: Brazil";
        case "eu-central":
          return ":flag_eu: Central Europe";
        case "eu-west":
          return ":flag_eu: Western Europe";
        case "europe":
          return ":flag_eu: Europe";
        case "dubai":
          return ":flag_ae: Dubai";
        case "frankfurt":
          return ":flag_de: Frankfurt";
        case "hongkong":
          return ":flag_hk: Hong Kong";
        case "london":
          return ":flag_gb: London";
        case "japan":
          return ":flag_jp: Japan";
        case "india":
          return ":flag_in: India";
        case "russia":
          return ":flag_ru: Russia";
        case "singapore":
          return ":flag_sg: Singapore";
        case "southafrica":
          return ":flag_za: South Africa";
        case "sydney":
          return ":flag_au: Sydney";
        case "us-central":
          return ":flag_us: US Central";
        case "us-east":
          return ":flag_us: US East";
        case "us-south":
          return ":flag_us: US South";
        case "us-west":
          return ":flag_us: US West";
        default:
          return region;
      }
    }

    // Sets the description
    const desc = [];
    desc.push({ name: "👑", value: `Owned by ${format.tag(guild.members.find(mem => mem.id === guild.ownerID))}` });
    desc.push({ name: "🆔", value: `${guild.id}` });
    desc.push({ name: "📅", value: `Created ${format.date(guild.createdAt)}` });
    desc.push({ name: "", value: `${regionFormat(guild.region)} server region` });
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
        description: desc.map(t => `${t.name} ${t.value}`).join("\n"),
        color: this.bot.embed.colour("general"),
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
