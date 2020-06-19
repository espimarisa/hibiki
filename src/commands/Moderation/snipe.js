const Command = require("structures/Command");

class snipeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["deletedmsg", "snipemsg"],
      description: "Gets the latest deleted message.",
    });
  }

  async run(msg) {
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (guildcfg && !guildcfg.snipingEnable) {
      return this.bot.embed(
        "❌ Error",
        `Message sniping hasn't been enabled. You can configure it using the [web dashboard](${this.bot.config.homepage}/dashboard/.)`,
        msg,
        "error",
      );
    }

    // If permission isn't public; member doesn't have the role
    if (guildcfg && !guildcfg.snipingPermission && guildcfg.staffRole && !msg.member.roles.includes(guildcfg.staffRole)) {
      return this.bot.embed("❌ Error", "You don't have the required role to view sniped messages.", msg, "error");
    }

    const snipeMsg = this.bot.snipeData[msg.channel.id];
    if (!snipeMsg) return this.bot.embed("❌ Error", "No message to snipe.", "error");

    msg.channel.createMessage({
      embed: {
        description: snipeMsg.content,
        color: this.bot.embed.color("general"),
        timestamp: new Date(snipeMsg.timestamp),
        author: {
          name: `${snipeMsg.author} said...`,
          icon_url: snipeMsg.authorpfp,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
        image: {
          url: snipeMsg.attachment,
        },
      },
    });
  }
}

module.exports = snipeCommand;
