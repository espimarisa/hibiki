/**
 * @file Endpoint typings
 * @description Mostly-accurate typings for certain endpoints and response data
 * @typedef endpoints
 */

import type { AxiosResponse } from "axios";

// Individual AUR package data
export interface AURPackageData {
  ID: number;
  Name: string;
  PackageBaseID: number;
  PackageBase: string;
  Version: string;
  Description: string;
  URL: string;
  NumVotes: number;
  Popularity: number;
  OutOfDate: boolean;
  Maintainer: string | string[];
  FirstSubmitted: 1590066074;
  LastModified: 1599927737;
  URLPath: string;
  MakeDepends: string[];
  Depends: string[];
  num: number;
}

// Nekobot.xyz images
export interface NekobotImage extends AxiosResponse {
  data: {
    success: boolean;
    message: string;
    version: string;
  };
}

// Nekos.life images
export interface NekosLifeImage extends AxiosResponse {
  data: {
    url: string;
    msg?: string;
  };
}

// Weeb.sh images
export interface WeebSHImage extends AxiosResponse {
  data: {
    url: string;
    message?: string;
  };
}

// Urban dictionary word
export interface UrbanWord {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: Date;
  example: string;
  thumbs_down: number;
}

// SauceNAO image data
export interface SauceNAOData {
  header: {
    similarity: string;
    thumbnail: string;
    index_id: number;
    index_name: string;
    dupes: number;
  };
}
