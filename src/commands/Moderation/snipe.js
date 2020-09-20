const Command = require("../../structures/Command");

class snipeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["deletedmsg", "snipemsg"],
      description: "Sends the latest deleted message in a channel.",
    });
  }

  async run(msg) {
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    // Sends if message sniping has been disabled
    if (guildconfig && guildconfig.snipingEnable === false) {
      return this.bot.embed(
        "❌ Error",
        `Message sniping hasn't been enabled. You can configure it using the [web dashboard](${this.bot.config.homepage}/manage/servers).`,
        msg,
        "error",
      );
    }

    // If permission isn't public; member doesn't have the role
    if (guildconfig && guildconfig.snipingPermission && guildconfig.snipingPermission === false && guildconfig.staffRole && !msg.member.roles.includes(guildconfig.staffRole)) {
      return this.bot.embed("❌ Error", "You don't have the required role to view sniped messages.", msg, "error");
    }

    // Gets the message to send
    const snipeMsg = this.bot.snipeData[msg.channel.id];
    if (!snipeMsg) return this.bot.embed("❌ Error", "No message to snipe.", msg, "error");

    msg.channel.createMessage({
      embed: {
        description: snipeMsg.content,
        color: this.bot.embed.color("general"),
        timestamp: new Date(snipeMsg.timestamp),
        author: {
          name: snipeMsg.author ? `${snipeMsg.author} said...` : null,
          icon_url: snipeMsg.authorpfp ? snipeMsg.authorpfp : null,
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
