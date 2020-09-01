const Command = require("../../structures/Command");

const statusCodes = [
  "100", "101", "200", "201", "202", "204", "206", "207", "300", "301", "302", "303", "304", "305", "307", "400", "401", "402",
  "403", "404", "405", "406", "408", "409", "410", "411", "412", "413", "414", "415", "416", "417", "418", "420", "421", "422", "423", "424", "425",
  "426", "429", "431", "444", "450", "451", "499", "500", "501", "502", "503", "504", "506", "507", "508", "509", "510", "511", "599",
];

class httpcatCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[code:string]",
      description: "Sends a picture of a HTTP Status Code cat.",
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
        title: `🐱 ${code}`,
        color: this.bot.embed.color("general"),
        image: {
          url: `https://http.cat/${code}.jpg`,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)} | Powered by http.cat`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = httpcatCommand;
