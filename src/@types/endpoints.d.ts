/**
 * @file Additional typing definitions for external API endpoints.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/**
 * GitHub API user response.
 * @see https://api.github.com/users/query
 */

export type GithubUser = {
  avatar_url: string;
  bio?: string;
  blog?: string;
  company?: string;
  email?: string;
  events_url?: string;
  followers?: number;
  followers_url?: string;
  following?: number;
  following_url?: string;
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
 * @see https://api.github.com/repos/query
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
 * @see https://api.github.com/repos/query
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
  forks?: number;
  forks_count?: number;
  forks_url?: string;
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
  open_issues?: number;
  open_issues_count?: number;
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
  watchers?: number;
  watchers_count?: number;
};

/**
 * Possible GitHub API response.
 * @see https://api.github.com/users/query
 * @see https://api.github.com/repos/query
 */

export type PossibleGithubResponse = GithubRepository & GithubUser;

/**
 * Possible IPInfo.IO API response.
 * @see https://ipinfo.io/developers#json-response
 */

export type IPInfoResponse = {
  bogon?: boolean;
  ip: string;
  hostname?: string;
  city?: string;
  region?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  postal?: string;
  timezone?: string;
  readme?: string;
  anycast?: boolean;
};

/**
 * XKCD comic API response.
 * @see https://xkcd.com/info.0.json
 */

export type XKCDResponse = {
  alt: string;
  day: number;
  img: string;
  link: string;
  month: number;
  news: string;
  num: number;
  safe_title: string;
  title: string;
  transcript: string;
  year: number;
};
