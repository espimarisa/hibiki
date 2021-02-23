const Command = require("../../structures/Command");

const statusCodes = [
  "100", "200", "201", "202", "203", "204", "206", "207", "208", "300", "301", "302", "303", "305", "306", "307", "308", "400",
  "401", "402", "403", "404", "405", "406", "407", "408", "409", "410", "411", "412", "413", "414", "416", "417", "418", "420", "423", "424", "425",
  "426", "429", "431", "444", "450", "451", "494", "500", "501", "502", "503", "504", "506", "507", "508", "509", "510",
];

class httpdogCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[code:string]",
      description: "Sends a picture of a HTTP Status Code dog.",
      cooldown: 3,
    });
  }

  run(msg, args) {
    // Gets the status code
    let code;
    const codeToFind = statusCodes.filter(c => c === `${args.join("")}`);
    if (!codeToFind || !codeToFind.length) code = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    else code = codeToFind;

    msg.channel.createMessage({
      embed: {
        title: `🐶 ${code}`,
        color: this.bot.embed.color("general"),
        image: {
          url: `https://httpstatusdogs.com/img/${code}.jpg`,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by httpstatusdogs.com`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = httpdogCommand;
