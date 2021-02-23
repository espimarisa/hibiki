const Command = require("../../structures/Command");
const format = require("../../utils/format");
const fetch = require("node-fetch");

class githubCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["gh"],
      args: "[query:string]",
      description: "Returns info about a GitHub user or repository.",
      requiredkeys: ["github"],
      allowdms: true,
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Looks for a repo
    if (args.join("").includes("/")) {
      const body = await fetch(`https://api.github.com/repos/${args.join("")}`, {
        headers: {
          "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
          "Authorization": `Token ${this.bot.key.github}`,
        },
      }).then(res => res.json().catch(() => {}));
      if (!body || !body.id || body.message) return this.bot.embed("❌ Error", "No information found.", msg, "error");

      const fields = [];
      if (body.owner && body.owner.login && !body.source) fields.push({ name: "Owner", value: body.owner.login, inline: true });
      if (body.fork) fields.push({ name: "Owner", value: `Forked from ${body.source.full_name}`, inline: true });
      if (body.language) fields.push({ name: "Main Language", value: `${body.language}`, inline: true });

      if (body.license && body.license.spdx_id !== "NOASSERTION") fields.push({
        name: "License",
        value: `${body.license.spdx_id}`,
        inline: true,
      });

      if (body.stargazers_count > 0) fields.push({ name: "Stars", value: body.stargazers_count, inline: true });
      if (body.subscribers_count > 0) fields.push({ name: "Watching", value: body.subscribers_count, inline: true });
      if (body.open_issues > 0) fields.push({ name: "Open Issues", value: body.open_issues, inline: true });
      if (body.forks > 0) fields.push({ name: "Total Forks", value: body.forks });
      if (body.homepage) fields.push({ name: "Homepage", value: body.homepage, inline: true });

      // Embed construct
      const embed = {
        color: 0x7DBBE6,
        fields: fields,
        author: {
          icon_url: body.owner.avatar_url,
          name: `${body.name} (${body.id})`,
          url: body.html_url,
        },
        thumbnail: {
          url: body.owner.avatar_url,
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      };

      if (body.description) embed.description = body.description;
      return msg.channel.createMessage({
        embed: embed,
      });
    }

    // Looks for a user
    const body = await fetch(`https://api.github.com/users/${encodeURIComponent(args.join(""))}`, {
      headers: {
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
        "Authorization": `Token ${this.bot.key.github}`,
      },
    }).then(res => res.json().catch(() => {}));
    if (!body || !body.id || body.message) return this.bot.embed("❌ Error", "No information found.", msg, "error");

    const fields = [];
    if (body.created_at) fields.push({ name: "Created", value: format.date(body.created_at) });
    if (body.public_repos > 0) fields.push({ name: "Repos", value: body.public_repos, inline: true });
    if (body.public_gists > 0) fields.push({ name: "Gists", value: body.public_gists, inline: true });
    if (body.followers > 0) fields.push({ name: "Followers", value: body.followers, inline: true });
    if (body.following > 0) fields.push({ name: "Following", value: body.following, inline: true });
    if (body.location) fields.push({ name: "Location", value: `${body.location}`, inline: true });
    if (body.blog) fields.push({ name: "Website", value: `${body.blog}`, inline: true });
    if (body.email) fields.push({ name: "Email", value: `${body.email}`, inline: true });

    const embed = {
      color: 0x7DBBE6,
      fields: fields,
      author: {
        name: `${body.login} (${body.id})`,
        icon_url: body.avatar_url,
        url: body.html_url,
      },
      thumbnail: {
        url: body.avatar_url,
      },
      footer: {
        text: `Ran by ${this.bot.tag(msg.author)}`,
        icon_url: msg.author.dynamicAvatarURL(),
      },
    };

    // If the item has a description
    if (body.bio) embed.description = body.bio;
    msg.channel.createMessage({
      embed: embed,
    });
  }
}

module.exports = githubCommand;
