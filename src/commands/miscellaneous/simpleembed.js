const Command = require("../../structures/Command");

class simpleembedCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<text:string>",
      description: "Creates a simple embed.",
    });
  }

  run(msg, args) {
    let imgurl;
    args = args.join(" ");
    // URL checker
    const urlcheck = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/.exec(args);
    if (urlcheck) args = args.slice(0, urlcheck.index) + args.slice(urlcheck.index + urlcheck[0].length, args.length);
    if (urlcheck) imgurl = urlcheck[0];
    if (!imgurl && msg.attachments && msg.attachments[0]) imgurl = msg.attachments[0].proxy_url;
    if (!imgurl) imgurl;

    msg.channel.createMessage({
      embed: {
        description: args,
        color: this.bot.embed.color("general"),
        author: {
          icon_url: msg.author.dynamicAvatarURL(),
          name: `${msg.member.nick || msg.author.username} says...`,
        },
        image: {
          url: imgurl ? imgurl : null,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = simpleembedCommand;
