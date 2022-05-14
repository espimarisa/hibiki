/**
 * @file Endpoints
 * @description Typings for external API endpoints
 * @typedef endpoints
 */

/**
 * Image from api.nekobot.xyz
 */

interface NekobotImage extends Response {
  message: string;
  success: boolean;
  version: string;
}

/**
 * Image from nekos.life
 */

interface NekosLifeImage extends Response {
  msg?: string;
  url?: string;
}

/**
 * Twitter user from Twitter API
 */
type TwitterUser = {
  id: string;
  id_str: string;
  name: string;
  screen_name: string;
  location: string;
  description: string;
  url: string;
  entities: {
    url: {
      urls: {
        url: string;
        expanded_url: string;
        display_url: string;
        indices: number[];
      }[];
    };
    description: {
      urls: {
        url: string;
        expanded_url: string;
        display_url: string;
        indices: number[];
      }[];
    };
  };
  protected: boolean;
  followers_count: number;
  friends_count: number;
  listed_count: number;
  created_at: string;
  favourites_count: number;
  utc_offset: number;
  time_zone: string;
  geo_enabled: boolean;
  verified: boolean;
  statuses_count: number;
  lang: string;
  contributors_enabled: boolean;
  is_translator: boolean;
  is_translation_enabled: boolean;
  profile_background_color: string;
  profile_background_image_url: string;
  profile_background_image_url_https: string;
  profile_background_tile: boolean;
  profile_image_url: string;
  profile_image_url_https: string;
  profile_banner_url: string;
  profile_link_color: string;
  profile_sidebar_border_color: string;
  profile_sidebar_fill_color: string;
  profile_text_color: string;
  profile_use_background_image: boolean;
  has_extended_profile: boolean;
  default_profile: boolean;
  default_profile_image: boolean;
  pinned_tweet_ids: number[];
  pinned_tweet_ids_str: string[];
  has_custom_timelines: boolean;
  following: boolean;
  follow_request_sent: boolean;

  notifications: boolean;
  advertiser_account_type: string;
  advertiser_account_service_levels: string[];
  business_profile_state: string;
  translator_type: string;
  require_some_consent: false;
};

/**
 * Github API stuff
 */
interface GithubUser {
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
  site_admin: boolean;
}

interface GithubOrganization {
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
  site_admin: boolean;
}

interface GithubLicense {
  key: string;
  name: string;
  spdx_id: string;
  url: string;
  node_id: string;
}

interface GithubRepository {
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
  issue_events_url: string;
  events_url: string;
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
}

/**
 * NPM API typings
 */

interface NpmPackage {
  "_id": string;
  "_rev": string;
  "name": string;
  "description": string;
  "repository": string;
  "author": string;
  "license": string;
  "versions": {
    [version: string]: NpmPackageVersion;
  };
  "maintainers": NpmPackageAuthor[];
  "dist-tags": {
    [version: string]: string;
    latest: string;
    beta?: string;
    unsupported?: string;
  };
  "time": {
    [key: string]: string;
    modified: string;
    created: string;
  };
  "users": {
    [user: string]: boolean;
  };
  "keywords": string[];
}

// I'm not typing (haha get it) all this
interface NpmPackageVersion {
  name: string;
  description?: string;
  version?: string;
  author?: NpmPackageAuthor;
  repository?: NpmPackageRepository;
  main?: string;
  dependencies?: {
    [key: string]: string;
  };
  devDependencies?: {
    [key: string]: string;
  };
  peerDependencies?: {
    [key: string]: string;
  };
  optionalDependencies?: {
    [key: string]: string;
  };
  scripts?: {
    [key: string]: string;
  };
  maintainers?: NpmPackageAuthor[];
  keywords?: string[];
  license?: string;
}

interface NpmPackageRepository {
  type: string;
  url: string;
}

interface NpmPackageAuthor {
  name: string;
  email: string;
}
