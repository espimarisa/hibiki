/**
 * @file Endpoint typings
 * @description Mostly-accurate typings for certain endpoints and response data
 * @typedef endpoints
 */

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
