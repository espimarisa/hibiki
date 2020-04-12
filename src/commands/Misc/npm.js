const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class npmCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["yarn"],
      args: "<package:string>",
      description: "Returns information about a npm package",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    const res = await fetch(`https://registry.npmjs.com/${encodeURIComponent(args.join(" ").toLowerCase())}`);
    let body = await res.json();
    if (body.error != undefined || !body["dist-tags"]) return msg.channel.createMessage(this.bot.embed("❌ Error", "Package not found.", "error"));
    let pkg = body.versions[body["dist-tags"].latest];

    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `📦 ${pkg.name}`,
        description: pkg.description,
        color: this.bot.embed.colour("general"),
        fields: [{
          name: "Keywords",
          value: pkg.keywords != undefined && pkg.keywords.length > 0 ? `${pkg.keywords.map(k => `\`${k}\``).join(", ")}` : "None",
        }, {
          name: "Link",
          value: `[https://npmjs.com/package/${args.join(" ").toLowerCase()}](https://www.npmjs.com/package/${args.join(" ").toLowerCase()})`,
          inlune: true,
        }, {
          name: "Latest Version",
          value: body["dist-tags"].latest,
          inline: true,
        }, {
          name: "License",
          value: body.license || "None",
          inline: true,
        }, {
          name: "Authors",
          value: pkg.maintainers.length > 0 ? pkg.maintainers.map(m => `\`${m.name}\``).join(", ") : "None",
        }],
      }
    });
  }
}

module.exports = npmCommand;
