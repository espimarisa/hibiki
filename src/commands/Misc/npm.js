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
    let res = await fetch(`https://registry.npmjs.com/${encodeURIComponent(args.join(" ").toLowerCase())}`);
    let body = await res.json();
    if (body.error !== undefined || !body["dist-tags"]) return msg.channel.createMessage(this.bot.embed("❌ Error", "Package not found.", "error"));
    let pkg = body.versions[body["dist-tags"].latest];

    // Sets the fields
    let fields = [];
    if (pkg.keywords !== undefined && pkg.keywords.length > 0) fields.push({ name: "Keywords", value: `${pkg.keywords.map(k => `\`${k}\``).join(", ")}` });
    fields.push({ name: "Link", value: `[https://npmjs.com/package/${args.join(" ").toLowerCase()}](https://www.npmjs.com/package/${args.join(" ").toLowerCase()})` });
    fields.push({ name: "Latest Version", value: body["dist-tags"].latest, inline: true });
    if (body.license) fields.push({ name: "License", value: body.license, inline: true });
    if (pkg.maintainers.length) fields.push({ name: "Maintainers", value: pkg.maintainers.map(m => `\`${m.name}\``).join(", "), inline: true });
    // Sends the embed
    msg.channel.createMessage({
      embed: {
        title: `📦 ${pkg.name}`,
        description: pkg.description,
        color: this.bot.embed.colour("general"),
        fields: fields,
      },
    });
  }
}

module.exports = npmCommand;
