const Command = require("../../structures/Command");
const fetch = require("node-fetch");
const format = require("../../utils/format");

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
    const body = await fetch(`https://registry.npmjs.com/${encodeURIComponent(args.join(" ").toLowerCase())}`)
      .then(res => res.json().catch(() => {}));

    if (body.error || !body["dist-tags"]) return this.bot.embed("❌ Error", "Package not found.", msg, "error");
    const pkg = body.versions[body["dist-tags"].latest];

    // Embed fields
    const fields = [];
    if (pkg.keywords && pkg.keywords.length > 0) fields.push({
      name: "Keywords",
      value: `${pkg.keywords.map(k => `\`${k}\``).join(", ")}`,
    });

    fields.push({
      name: "Link",
      value: `[https://npmjs.com/package/${args.join(" ").toLowerCase()}](https://www.npmjs.com/package/${args.join(" ").toLowerCase()})`,
    });

    fields.push({
      name: "Latest Version",
      value: body["dist-tags"].latest,
      inline: true,
    });

    if (body.license && !body.license.type) fields.push({ name: "License", value: `${body.license}`, inline: true });
    if (body.license && body.license.type) fields.push({ name: "License", value: `${body.license.type}`, inline: true });

    if (pkg.maintainers && pkg.maintainers.length) fields.push({
      name: "Maintainers",
      value: pkg.maintainers.map(m => `\`${m.name}\``).join(", "),
      inline: true,
    });

    if (body.time && body.time.created) fields.push({
      name: "Created",
      value: `${format.date(body.time.created)}`,
      inline: true,
    });

    if (body.time && body.time.modified) fields.push({
      name: "Updated",
      value: `${format.date(body.time.modified)}`,
      inline: true,
    });

    msg.channel.createMessage({
      embed: {
        title: `📦 ${pkg.name}`,
        description: pkg.description,
        color: 0xCC3534,
        fields: fields,
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = npmCommand;
