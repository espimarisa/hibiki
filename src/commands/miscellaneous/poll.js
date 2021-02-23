const Command = require("../../structures/Command");

class pollCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["createpoll", "startpoll"],
      args: "<member:member&fallback>",
      description: "Creates a poll members can react to.",
    });
  }

  async run(msg, args) {
    // URL checker
    let imgurl;
    args = args.join(" ");
    const urlcheck = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.exec(args);
    if (urlcheck) args = args.slice(0, urlcheck.index) + args.slice(urlcheck.index + urlcheck[0].length, args.length);
    if (urlcheck) imgurl = urlcheck[0];
    if (!imgurl && msg.attachments && msg.attachments[0]) imgurl = msg.attachments[0].proxy_url;
    if (!imgurl) imgurl = null;

    // If no text is given
    if (!args[0]) return this.bot.embed("❌ Error", "You didn't provide anything to put in the poll.", msg, "error");

    // Sends the poll
    const pollmsg = await msg.channel.createMessage({
      embed: {
        description: args,
        color: this.bot.embed.color("general"),
        author: {
          icon_url: msg.author.dynamicAvatarURL(),
          name: `${msg.member.nick || msg.author.username} asked...`,
        },
        thumbnail: {
          url: imgurl ? imgurl : null,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });

    // Adds poll reactions
    await pollmsg.addReaction("👍").catch(() => {});
    await pollmsg.addReaction("👎").catch(() => {});
  }
}

module.exports = pollCommand;
