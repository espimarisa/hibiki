/**
 * @file Additional typings for external API endpoints.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/**
 * A GitHub user.
 * @see https://api.github.com/users/query
 */

type GithubUser = {
  bio: string;
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  followers: number;
  public_gists: number;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  email: string;
  following: number;
  public_repos: number;
  site_admin: boolean;
};

/**
 * A GitHub license.
 * @see https://api.github.com/repos/query
 */

type GithubLicense = {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
};

/**
 * A GitHub repository.
 * @see https://api.github.com/repos/query
 */

type GithubRepository = {
  id: number;
  node_id: string;
  name: string;
  full_name: string;
  private: boolean;
  owner: GithubUser;
  html_url: string;
  description: string;
  fork: boolean;
  url: string;
  forks_url: string;
  keys_url: string;
  collaborators_url: string;
  teams_url: string;
  hooks_url: string;
  template: string;
  issue_events_url: string;
  events_url: string;
  source: GithubRepository;
  assignees_url: string;
  branches_url: string;
  tags_url: string;
  blobs_url: string;
  git_tags_url: string;
  git_refs_url: string;
  trees_url: string;
  statuses_url: string;
  languages_url: string;
  stargazers_url: string;
  contributors_url: string;
  subscribers_url: string;
  subscription_url: string;
  commits_url: string;
  git_commits_url: string;
  comments_url: string;
  issue_comment_url: string;
  contents_url: string;
  compare_url: string;
  merges_url: string;
  archive_url: string;
  downloads_url: string;
  issues_url: string;
  pulls_url: string;
  milestones_url: string;
  notifications_url: string;
  labels_url: string;
  releases_url: string;
  deployments_url: string;
  created_at: Date;
  updated_at: Date;
  pushed_at: Date;
  git_url: string;
  ssh_url: string;
  clone_url: string;
  svn_url: string;
  homepage: string;
  size: number;
  stargazers_count: number;
  watchers_count: number;
  language: string;
  has_issues: boolean;
  has_projects: boolean;
  has_downloads: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  forks_count: number;
  mirror_url?: string;
  archived: boolean;
  disabled: boolean;
  open_issues_count: number;
  license: GithubLicense;
  allow_forking: boolean;
  is_template: boolean;
  topics: string[];
  visibility: string;
  forks: number;
  open_issues: number;
  watchers: number;
  default_branch: string;
  temp_clone_token?: string;
  network_count: number;
  subscribers_count: number;
};

/**
 * A possible GitHub API response.
 * @see https://api.github.com/users/query
 * @see https://api.github.com/repos/query
 */

type PossibleGithubResponse = GithubUser & GithubRepository;
