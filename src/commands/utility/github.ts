import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { dateFormat } from "../../utils/format";
import axios from "axios";

export class GitHubCommand extends Command {
  description = "Returns info about a user or repository on GitHub.";
  requiredkeys = ["github"];
  args = "<query:string>";
  aliases = ["gh"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Searches for a repository
    if (args.join("").includes("/")) {
      const body = await axios
        .get(`https://api.github.com/repos/${args.join("")}`, {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": `${this.bot.user.username}`,
            "Authorization": `Token ${this.bot.config.keys.github}`,
          },
        })
        .catch(() => {});

      // If nothing is found
      if (!body || !body?.data?.id || body?.data?.message) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.GITHUB_ERROR"), "error");
      }

      // Embed fields
      const fields: EmbedField[] = [];
      const dates: EmbedField[] = [];

      // Creation date
      if (body.data.created_at) {
        dates.push({
          name: msg.string("utility.CREATED_AT"),
          value: `${dateFormat(body.data.created_at)}`,
        });
      }

      // Last update
      if (body.data.updated_at) {
        dates.push({
          name: msg.string("utility.UPDATED_AT"),
          value: `${dateFormat(body.data.updated_at)}`,
        });
      }

      // Last push
      if (body.data.pushed_at) {
        dates.push({
          name: msg.string("utility.GITHUB_LASTPUSH"),
          value: `${dateFormat(body.data.pushed_at)}`,
        });
      }

      // Timestamps
      if (dates.length) {
        fields.push({
          name: msg.string("utility.GITHUB_REPOSITORY"),
          value: `${dates.map((d) => `${d.name} ${d.value}`).join("\n")}`,
        });
      }

      // Owner info
      if (body.data.owner?.login && !body.data.source) {
        fields.push({
          name: msg.string("global.OWNER"),
          value: body.data.owner.login,
          inline: true,
        });
      }

      // If it's a fork
      if (body.data.fork && body.data.source?.full_name) {
        fields.push({
          name: msg.string("global.OWNER"),
          value: msg.string("utility.GITHUB_FORKED_FROM", { repo: body.data.source?.full_name }),
          inline: true,
        });
      }

      // Primary language
      if (body.data.language) {
        fields.push({
          name: msg.string("utility.GITHUB_LANGUAGE"),
          value: `${body.data.language}`,
          inline: true,
        });
      }

      // License
      if (body.data.license?.spdx_id && body.data.license?.spdx_id !== "NOASSERTION")
        fields.push({
          name: msg.string("utility.GITHUB_LICENSE"),
          value: `${body.data.license.spdx_id}`,
          inline: true,
        });

      // Total stars
      if (body.data.stargazers_count > 0) {
        fields.push({
          name: msg.string("utility.GITHUB_STARS"),
          value: `${body.data.stargazers_count}`,
          inline: true,
        });
      }

      // Total watchers
      if (body.data.subscribers_count > 0) {
        fields.push({
          name: msg.string("utility.GITHUB_WATCHING"),
          value: `${body.data.subscribers_count}`,
          inline: true,
        });
      }

      // Issues open
      if (body.data.open_issues > 0) {
        fields.push({
          name: msg.string("utility.GITHUB_ISSUES"),
          value: `${body.data.open_issues}`,
          inline: true,
        });
      }

      // Total forks
      if (body.data.forks > 0) {
        fields.push({
          name: msg.string("utility.GITHUB_FORKS"),
          value: `${body.data.forks}`,
          inline: true,
        });
      }

      // Homepage
      if (body.data.homepage) {
        fields.push({
          name: msg.string("utility.GITHUB_HOMEPAGE"),
          value: `${body.data.homepage}`,
          inline: true,
        });
      }

      // Sends embed with profile info
      msg.channel.createMessage({
        embed: {
          description: `${body.data.description ?? ""}`,
          color: msg.convertHex("general"),
          fields: fields,
          author: {
            name: `${body.data.name} (${body.data.id})`,
            icon_url: body.data.owner.avatar_url,
            url: body.data.html_url,
          },
          thumbnail: {
            url: body.data.owner.avatar_url,
          },
          footer: {
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    } else {
      // Searches for a user or organization
      const body = await axios
        .get(`https://api.github.com/users/${encodeURIComponent(args.join(""))}`, {
          headers: {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": `${this.bot.user.username}`,
            "Authorization": `Token ${this.bot.config.keys.github}`,
          },
        })
        .catch(() => {});

      // If nothing is found
      if (!body || !body?.data?.id || body?.data?.message) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.GITHUB_ERROR"), "error");
      }

      // Embed fields
      const fields: EmbedField[] = [];

      // Created at
      if (body.data.created_at) {
        fields.push({
          name: msg.string("general.USER_ACCOUNT"),
          value:
            `${msg.string("global.CREATED_AT")} ${dateFormat(body.data.created_at)}` +
            (body.data.updated_at ? `\n${msg.string("utility.UPDATED_AT")} ${dateFormat(body.data.updated_at)}` : ""),
        });
      }

      // Repositories
      if (body.data.public_repos > 0) {
        fields.push({
          name: msg.string("utility.GITHUB_REPOSITORIES"),
          value: `${body.data.public_repos}`,
          inline: true,
        });
      }

      // Followers
      if (body.data.followers > 0) {
        fields.push({
          name: msg.string("utility.FOLLOWERS"),
          value: `${body.data.followers}`,
          inline: true,
        });
      }

      // Following
      if (body.data.following > 0) {
        fields.push({
          name: msg.string("utility.FOLLOWING"),
          value: `${body.data.following}`,
          inline: true,
        });
      }

      // Gists
      if (body.data.public_gists > 0) {
        fields.push({
          name: msg.string("utility.GITHUB_GISTS"),
          value: `${body.data.public_gists}`,
          inline: true,
        });
      }

      // Location
      if (body.data.location) {
        fields.push({
          name: msg.string("utility.LOCATION"),
          value: `${body.data.location}`,
          inline: true,
        });
      }

      // Company
      if (body.data.company) {
        fields.push({
          name: msg.string("utility.GITHUB_COMPANY"),
          value: `${body.data.company}`,
          inline: true,
        });
      }

      // Website/blog
      if (body.data.blog) {
        fields.push({
          name: msg.string("utility.WEBSITE"),
          value: `${body.data.blog}`,
          inline: true,
        });
      }

      // Twitter
      if (body.data.twitter_username) {
        fields.push({
          name: msg.string("utility.TWITTER"),
          value: `[@${body.data.twitter_username}](https://twitter.com/${body.data.twitter_username})`,
          inline: true,
        });
      }

      // Email
      if (body.data.email) {
        fields.push({
          name: msg.string("utility.EMAIL"),
          value: `${body.data.email}`,
          inline: true,
        });
      }

      // Sends embed with profile info
      msg.channel.createMessage({
        embed: {
          description: `${body.data.bio ?? ""}`,
          color: msg.convertHex("general"),
          fields: fields,
          author: {
            name: `${body.data.login} (${body.data.id})`,
            icon_url: body.data.avatar_url,
            url: body.data.html_url,
          },
          thumbnail: {
            url: body.data.avatar_url,
          },
          footer: {
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }
  }
}
