import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import type { API_KEYS } from "$utils/env.ts";
import { sendErrorReply } from "$utils/error.ts";
import { hibikiFetch } from "$utils/fetch.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { t } from "i18next";

const API_BASEURL = "https://api.github.com";
const API_REQUIRED_HEADER = "application/vnd.github+json";

export class GithubCommand extends HibikiCommand {
  userInstallable = true;
  requiredAPIKeys: API_KEYS[] = ["API_GITHUB_PAT"];

  options: HibikiCommandOptions[] = [
    {
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async runCommand(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString((this.options as APIOption[])[0]!.name, true);
    const fields: EmbedField[] = [];

    // Looks up the query
    let response: Response | undefined;
    let isRepo = false;

    // Repository lookup
    if (query.includes("/")) {
      isRepo = true;
      response = await hibikiFetch(`${API_BASEURL}/repos/${query}`, {
        headers: {
          Accept: API_REQUIRED_HEADER,
        },
      });
    } else {
      // Account lookup
      response = await hibikiFetch(`${API_BASEURL}/users/${query}`, {
        headers: {
          Accept: API_REQUIRED_HEADER,
        },
      });
    }

    // Converts response; handles errors
    const body = await response?.json();
    if (!(response && body?.id) || body.message) {
      await sendErrorReply("commands:COMMAND_GITHUB_NOTFOUND", interaction);
      return;
    }

    // Creation date
    if (body.created_at) {
      fields.push({
        name: t("global:CREATED_ON", { lng: interaction.locale }),
        value: createFullTimestamp(new Date(body.created_at)),
        inline: false,
      });
    }

    // Repo-only fields
    if (isRepo) {
      // Last update date
      if (body.updated_at) {
        fields.push({
          name: t("global:UPDATED_ON", { lng: interaction.locale }),
          value: createFullTimestamp(new Date(body.updated_at)),
          inline: false,
        });
      }

      // Last push date
      if (body.pushed_at) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_LASTPUSHED", { lng: interaction.locale }),
          value: createFullTimestamp(new Date(body.pushed_at)),
          inline: false,
        });
      }

      // Repo owner info
      if (body.owner?.login) {
        fields.push({
          name: t("global:OWNER", { lng: interaction.locale }),
          value: body.owner.login,
          inline: true,
        });
      }

      // Template
      if (body.template) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_TEMPLATE", { lng: interaction.locale }),
          value: "True",
          inline: true,
        });
      }

      // Archived
      if (body.archived) {
        fields.push({
          name: t("global:ARCHIVED", { lng: interaction.locale }),
          value: t("booleans:YES", { lng: interaction.locale }),
          inline: true,
        });
      }

      // Disabled
      if (body.disabled) {
        fields.push({
          name: t("global:DISABLED", { lng: interaction.locale }),
          value: t("booleans:YES", { lng: interaction.locale }),
          inline: true,
        });
      }

      // Fork
      if (body.fork && body.source) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_FORK", { lng: interaction.locale }),
          value: t("commands:COMMAND_GITHUB_FORKEDFROM", { lng: interaction.locale, source: body.source.full_name }),
          inline: true,
        });
      }

      // Primary language
      if (body.language) {
        fields.push({
          name: t("global:LANGUAGE", { lng: interaction.locale }),
          value: `${body.language}`,
          inline: true,
        });
      }

      // License; ignore NOASSERTION
      if (body.license?.spdx_id !== "NOASSERTION") {
        fields.push({
          name: t("global:LICENSE", { lng: interaction.locale }),
          value: `${body.license.spdx_id}`,
          inline: true,
        });
      }

      // Total star count
      if (body.stargazers_count) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_STARS", { lng: interaction.locale }),
          value: body.stargazers_count.toString(),
          inline: true,
        });
      }

      // Total watcher count
      if (body.subscribers_count) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_WATCHERS", { lng: interaction.locale }),
          value: body.subscribers_count.toString(),
          inline: true,
        });
      }

      // Total issues open
      if (body.open_issues) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_ISSUES", { lng: interaction.locale }),
          value: body.open_issues.toString(),
          inline: true,
        });
      }

      // Total forks
      if (body.forks) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_FORKS", { lng: interaction.locale }),
          value: body.forks.toString(),
          inline: true,
        });
      }

      // Homepage
      if (body.homepage) {
        fields.push({
          name: t("global:HOMEPAGE", { lng: interaction.locale }),
          value: `${body.homepage}`,
          inline: false,
        });
      }

      // Topics
      if (body.topics) {
        fields.push({
          name: t("commands:COMMAND_GITHUB_TOPICS", { lng: interaction.locale, count: body.topics.length }),
          value: body.topics.map((m: Record<string, string>) => `\`${m}\``).join(", "),
          inline: false,
        });
      }
    }

    // Total user repositories
    if (body.public_repos) {
      fields.push({
        name: t("commands:COMMAND_GITHUB_REPOS", { lng: interaction.locale }),
        value: body.public_repos.toString(),
        inline: true,
      });
    }

    // Total user followers
    if (body.followers) {
      fields.push({
        name: t("global:FOLLOWERS", { lng: interaction.locale }),
        value: body.followers.toString(),
        inline: true,
      });
    }

    // Total user following
    if (body.following) {
      fields.push({
        name: t("global:FOLLOWING", { lng: interaction.locale }),
        value: body.following.toString(),
        inline: true,
      });
    }

    // Total user gists
    if (body.public_gists) {
      fields.push({
        name: t("commands:COMMAND_GITHUB_GISTS", { lng: interaction.locale }),
        value: body.public_gists.toString(),
        inline: true,
      });
    }

    // User location
    if (body.location) {
      fields.push({
        name: t("global:LOCATION", { lng: interaction.locale }),
        value: `${body.location}`,
        inline: true,
      });
    }

    // User company
    if (body.company) {
      fields.push({
        name: t("commands:COMMAND_GITHUB_COMPANY", { lng: interaction.locale }),
        value: `${body.company}`,
        inline: true,
      });
    }

    // User website
    if (body.blog) {
      fields.push({
        name: t("global:WEBSITE", { lng: interaction.locale }),
        value: `${body.blog}`,
        inline: true,
      });
    }

    // User X/Twitter
    if (body.twitter_username) {
      fields.push({
        name: t("global:XTWITTER", { lng: interaction.locale }),
        value: `[@${body.twitter_username}](https://x.com/${body.twitter_username})`,
        inline: true,
      });
    }

    // User email
    if (body.email) {
      fields.push({
        name: t("global:EMAIL", { lng: interaction.locale }),
        value: `${body.email}`,
        inline: true,
      });
    }

    // Sends the information
    await interaction.followUp({
      embeds: [
        {
          description: isRepo ? body.description ?? "" : body.bio ?? "",
          color: HibikiColors.GENERAL,
          fields: fields,
          author: {
            name: `${isRepo ? body.name : body.login} (${body.id})`,
            icon_url: isRepo ? body.owner.avatar_url : body.avatar_url,
            url: body.html_url,
          },
          thumbnail: {
            // TODO: Look into why this doesn't embed without appending a fake .png
            url: isRepo ? `${body.owner.avatar_url}.png` : `${body.avatar_url}.png`,
          },
        },
      ],
    });
  }
}
