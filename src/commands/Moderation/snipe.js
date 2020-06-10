const Command = require("structures/Command");
const format = require("utils/format");

class snipeCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["deletedmsg", "snipemsg"],
      args: "[role:role]",
      description: "Gets the latest deleted message.",
    });
  }

  async run(msg) {
    const guildcfg = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);

    if (guildcfg && !guildcfg.snipingEnable) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", `Message sniping hasn't been enabled. You can configure it using the [web dashboard](${this.bot.config.homepage}/dashboard/.)`, "error"));
    }

    // If permission isn't public; member doesn't have the role
    if (guildcfg && !guildcfg.snipingPermission && guildcfg.staffRole && !msg.member.roles.includes(guildcfg.staffRole)) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "You don't have the required role to view sniped messages.", "error"));
    }

    const snipeMsg = this.bot.snipeData[msg.channel.id];
    if (!snipeMsg) return msg.channel.createMessage(this.bot.embed("❌ Error", "No message to snipe.", "error"));

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
          icon_url: this.bot.user.dynamicAvatarURL(),
          text: `Sniped by ${format.tag(msg.author)}`,
        },
        image: {
          url: snipeMsg.attachment,
        },
      },
    });
  }
}

module.exports = snipeCommand;
