const Command = require("../../structures/Command");
const responses = [
  "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes - definitely.", "You may rely on it.", "As I see it, yes.", "Most likely.",
  "Outlook good.", "Yes.", "Signs point to yes.", "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.",
  "Concentrate and ask again.", "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful.",
];

class eightballCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["ask", "askball", "ball"],
      args: "[question:string]",
      description: "Asks an 8-Ball a question.",
      allowdms: true,
    });
  }

  run(msg) {
    this.bot.embed("🎱 8ball", `${responses[Math.floor(Math.random() * responses.length)]}`, msg);
  }
}

module.exports = eightballCommand;
