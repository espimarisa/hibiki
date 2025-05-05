/**
 * @file Slash command to get information about a GitHub user or repository.
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { sendErrorReply } from "@/utils/error.ts";
import { hFetch } from "@/utils/fetch.ts";
import { t, tO } from "@/utils/i18n.ts";
import {
  EmbedBuilder,
  SlashCommandBuilder,
  TimestampStyles,
  time,
} from "discord.js";

// GitHub API urls and headers.
const API_BASEURL = "https://api.github.com";
const API_REQUIRED_HEADER = "application/vnd.github+json";

// Regex to validate GitHub URLs.
const GITHUB_URL_REGEX = /^https:\/\/(www\.)?github\.com\//;

export const githubCommand = {
  data: new SlashCommandBuilder()
    .setName("github")
    .setNameLocalizations(tO("commands:GITHUB_NAME"))
    .setDescription(t("commands:GITHUB_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:GITHUB_DESCRIPTION"))
    // User subcommand.
    .addSubcommand((user) =>
      user
        .setName("user")
        .setNameLocalizations(tO("commands:GITHUB_USER_USERNAME_NAME"))
        .setDescription(t("commands:GITHUB_USER_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:GITHUB_USER_DESCRIPTION"))
        // Username option.
        .addStringOption((username) =>
          username
            .setName(t("commands:GITHUB_USER_USERNAME_NAME"))
            .setNameLocalizations(tO("commands:GITHUB_USER_USERNAME_NAME"))
            .setDescription(t("commands:GITHUB_USER_USERNAME_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:GITHUB_USER_USERNAME_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    )
    // Repository subcommand.
    .addSubcommand((repository) =>
      repository
        .setName("repository")
        .setNameLocalizations(tO("commands:GITHUB_REPOSITORY_NAME"))
        .setDescription(t("commands:GITHUB_REPOSITORY_DESCRIPTION"))
        .setDescriptionLocalizations(
          tO("commands:GITHUB_REPOSITORY_DESCRIPTION"),
        )
        // URL option.
        .addStringOption((url) =>
          url
            .setName(t("commands:GITHUB_REPOSITORY_URL_NAME"))
            .setNameLocalizations(tO("commands:GITHUB_REPOSITORY_URL_NAME"))
            .setDescription(t("commands:GITHUB_REPOSITORY_URL_DESCRIPTION"))
            .setDescriptionLocalizations(
              tO("commands:GITHUB_REPOSITORY_URL_DESCRIPTION"),
            )
            .setRequired(true),
        ),
    ),

  async run(interaction) {
    // Defers the reply.
    await interaction.deferReply();

    // Gets the subcommand and query.
    const subcommand = interaction.options.getSubcommand(true);
    let query = interaction.options.getString("query", true);
    let isRepository = false;
    let response: Response | undefined;

    // Fetches a repository.
    query = query.replace(GITHUB_URL_REGEX, "");
    if (subcommand === "repository") {
      isRepository = true;
      response = await hFetch(`${API_BASEURL}/repos/${query}`, {
        headers: {
          Accept: API_REQUIRED_HEADER,
        },
      });
    } else {
      // Fetches a user.
      response = await hFetch(`${API_BASEURL}/users/${query}`, {
        headers: {
          Accept: API_REQUIRED_HEADER,
        },
      });
    }

    // Error handler for invalid response.
    if (!response) {
      await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
      return;
    }

    // Converts response into JSON.
    const body: PossibleGithubResponse = await response.json();
    if (!body?.id) {
      await sendErrorReply(interaction, "errors:GITHUB_QUERY", true, true);
      return;
    }

    // Creates the embed.
    const embed = new EmbedBuilder().setColor(HibikiColors.Primary);

    // Creation date.
    if (body.created_at) {
      embed.addFields({
        name: t("common:CREATED_ON"),
        value: time(new Date(body.created_at), TimestampStyles.ShortDateTime),
        inline: false,
      });
    }

    // Last updated.
    if (body.updated_at) {
      embed.addFields({
        name: t("common:UPDATED_ON", { lng: interaction.locale }),
        value: time(new Date(body.updated_at), TimestampStyles.ShortDateTime),
        inline: false,
      });
    }

    // Repository owner.
    if (body.owner?.login) {
      embed.addFields({
        name: t("common:OWNER", { lng: interaction.locale }),
        value: body.owner.login,
        inline: true,
      });
    }

    // Repository template status.
    if (body.template) {
      embed.addFields({
        name: t("commands:GITHUB_TEMPLATE", { lng: interaction.locale }),
        value: t("common:TRUE", { lng: interaction.locale }),
        inline: true,
      });
    }

    // Repository archival status.
    if (body.archived) {
      embed.addFields({
        name: t("commands:GITHUB_ARCHIVED", { lng: interaction.locale }),
        value: t("common:TRUE", { lng: interaction.locale }),
        inline: true,
      });
    }

    // Repository disabled status.
    if (body.disabled) {
      embed.addFields({
        name: t("common:DISABLED", { lng: interaction.locale }),
        value: t("common:TRUE", { lng: interaction.locale }),
        inline: true,
      });
    }

    // Repository fork information.
    if (body.fork && body.source?.full_name) {
      embed.addFields({
        name: t("commands:GITHUB_FORKED_FROM", { lng: interaction.locale }),
        value: body.source.full_name,
        inline: true,
      });
    }

    // Repository primary language.
    if (body.language) {
      embed.addFields({
        name: t("common:LANGUAGE", { lng: interaction.locale }),
        value: body.language,
        inline: true,
      });
    }

    // Repository license; ignore NOASSERTION.
    if (body.license?.spdx_id && body.license.spdx_id !== "NOASSERTION") {
      embed.addFields({
        name: t("common:LICENSE"),
        value: body.license.spdx_id,
        inline: true,
      });
    }

    // Repository stars.
    if (body.stargazers_count) {
      embed.addFields({
        name: t("commands:GITHUB_STARGAZERS", { lng: interaction.locale }),
        value: body.stargazers_count.toString(),
        inline: true,
      });
    }

    // Repository watchers.
    if (body.subscribers_count) {
      embed.addFields({
        name: t("commands:GITHUB_WATCHERS", { lng: interaction.locale }),
        value: body.subscribers_count.toString(),
        inline: true,
      });
    }

    // Repository issue count.
    if (body.open_issues) {
      embed.addFields({
        name: t("commands:GITHUB_ISSUES", { lng: interaction.locale }),
        value: body.open_issues.toString(),
        inline: true,
      });
    }

    // Repository fork count.
    if (body.forks) {
      embed.addFields({
        name: t("commands:GITHUB_FORKS", { lng: interaction.locale }),
        value: body.forks.toString(),
        inline: true,
      });
    }

    // Repository homepage.
    if (body.homepage) {
      embed.addFields({
        name: t("common:HOMEPAGE", { lng: interaction.locale }),
        value: body.homepage,
        inline: true,
      });
    }

    // Repository topics.
    if (body.topics && body.topics.length > 0) {
      embed.addFields({
        name: t("commands:GITHUB_TOPICS"),
        value: body.topics.map((topic) => `\`${topic}\``).join(", "),
        inline: false,
      });
    }
    // User's total repositories.
    if (body.public_repos) {
      embed.addFields({
        name: t("commands:GITHUB_REPOSITORIES", { lng: interaction.locale }),
        value: body.public_repos.toString(),
        inline: true,
      });
    }

    // User's total followers.
    if (body.followers) {
      embed.addFields({
        name: t("common:FOLLOWERS", {
          lng: interaction.locale,
          count: body.followers,
        }),
        value: body.followers.toString(),
        inline: true,
      });
    }

    // User's total following.
    if (body.following) {
      embed.addFields({
        name: t("common:FOLLOWING", { lng: interaction.locale }),
        value: body.following.toString(),
        inline: true,
      });
    }

    // User's total gists.
    if (body.public_gists) {
      embed.addFields({
        name: t("commands:GITHUB_GISTS", { lng: interaction.locale }),
        value: body.public_gists.toString(),
        inline: true,
      });
    }

    // User's location.
    if (body.location) {
      embed.addFields({
        name: t("common:LOCATION", { lng: interaction.locale }),
        value: body.location,
        inline: true,
      });
    }

    // User's company.
    if (body.company) {
      embed.addFields({
        name: t("commands:GITHUB_COMPANY", { lng: interaction.locale }),
        value: body.company,
        inline: true,
      });
    }

    // User's website.
    if (body.blog) {
      embed.addFields({
        name: t("common:WEBSITE", { lng: interaction.locale }),
        value: body.blog,
        inline: true,
      });
    }

    // User's X/Twitter.
    if (body.twitter_username) {
      embed.addFields({
        name: t("commands:GITHUB_XTWITTER", { lng: interaction.locale }),
        value: `[@${body.twitter_username}](https://x.com/${body.twitter_username})`,
        inline: true,
      });
    }

    // User's email.
    if (body.email) {
      embed.addFields({
        name: t("common:EMAIL", { lng: interaction.locale }),
        value: body.email,
        inline: true,
      });
    }

    // Sets the embed description.
    embed.setDescription(
      isRepository ? body.description || "" : body.bio || "",
    );

    // Sets the embed author.
    embed.setAuthor({
      iconURL: isRepository ? body.owner.avatar_url : body.avatar_url,

      // Repository name or username.
      name: `${isRepository ? body.name || "" : body.login || ""} (${body.id})`,
      url: body.html_url || "",
    });

    // Sets the embed thumbnail.
    embed.setThumbnail(
      isRepository ? `${body.owner.avatar_url}.png` : `${body.avatar_url}.png`,
    );

    // Sends the interaction.
    await interaction.followUp({ embeds: [embed] });
  },
} satisfies HibikiCommand;

/**
 * GitHub API user response.
 * @see https://api.github.com/users/query.
 */

export type GithubUser = {
  avatar_url: string;
  bio?: string;
  blog?: string;
  company?: string;
  email?: string;
  events_url?: string;
  followers_url?: string;
  followers?: number;
  following_url?: string;
  following?: number;
  gists_url?: string;
  gravatar_id?: string;
  html_url?: string;
  id: number;
  location?: string;
  login: string;
  node_id?: string;
  organizations_url?: string;
  public_gists?: number;
  public_repos?: number;
  received_events_url?: string;
  repos_url?: string;
  site_admin?: boolean;
  starred_url?: string;
  subscriptions_url?: string;
  twitter_username?: string;
  type?: string;
  url?: string;
};

/**
 * GitHub API license response.
 * @see https://api.github.com/repos/query.
 */

export type GithubLicense = {
  key?: string;
  name?: string;
  node_id?: string;
  spdx_id?: string;
  url?: string;
};

/**
 * GitHub API repository response.
 * @see https://api.github.com/repos/query.
 */

export type GithubRepository = {
  allow_forking?: boolean;
  archive_url?: string;
  archived?: boolean;
  assignees_url?: string;
  blobs_url?: string;
  branches_url?: string;
  clone_url?: string;
  collaborators_url?: string;
  comments_url?: string;
  commits_url?: string;
  compare_url?: string;
  contents_url?: string;
  contributors_url?: string;
  created_at?: Date;
  default_branch?: string;
  deployments_url?: string;
  description?: string;
  disabled?: boolean;
  downloads_url?: string;
  events_url?: string;
  fork?: boolean;
  forks_count?: number;
  forks_url?: string;
  forks?: number;
  full_name: string;
  git_commits_url?: string;
  git_refs_url?: string;
  git_tags_url?: string;
  git_url?: string;
  has_downloads?: boolean;
  has_issues?: boolean;
  has_pages?: boolean;
  has_projects?: boolean;
  has_wiki?: boolean;
  homepage?: string;
  hooks_url?: string;
  html_url?: string;
  id?: number;
  is_template?: boolean;
  issue_comment_url?: string;
  issue_events_url?: string;
  issues_url?: string;
  keys_url?: string;
  labels_url?: string;
  language?: string;
  languages_url?: string;
  license?: GithubLicense;
  merges_url?: string;
  milestones_url?: string;
  mirror_url?: string;
  name: string;
  network_count?: number;
  node_id?: string;
  notifications_url?: string;
  open_issues_count?: number;
  open_issues?: number;
  owner: GithubUser;
  private?: boolean;
  pulls_url?: string;
  pushed_at?: Date;
  releases_url?: string;
  size?: number;
  source?: GithubRepository;
  ssh_url?: string;
  stargazers_count?: number;
  stargazers_url?: string;
  statuses_url?: string;
  subscribers_count?: number;
  subscribers_url?: string;
  subscription_url?: string;
  svn_url?: string;
  tags_url?: string;
  teams_url?: string;
  temp_clone_token?: string;
  template?: string;
  topics?: string[];
  trees_url?: string;
  updated_at?: Date;
  url?: string;
  visibility?: string;
  watchers_count?: number;
  watchers?: number;
};

/**
 * Possible GitHub API response.
 * @see https://api.github.com/users/query.
 * @see https://api.github.com/repos/query.
 */

type PossibleGithubResponse = GithubRepository & GithubUser;
