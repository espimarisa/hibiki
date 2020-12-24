/**
 * @file Database
 * @description Base structure for database providers
 */

import type { HibikiClient } from "./Client";
const errorString = "Method not implemented.";

export class DatabaseProvider {
  bot: HibikiClient;

  /** Creates a new database provider */
  constructor(bot: HibikiClient) {
    this.bot = bot;
  }

  // Gets a server's config
  getGuildConfig(id: string) {
    if (!id) throw new Error(errorString);
  }

  // Get's a user's config
  getUserConfig(id: string) {
    if (!id) throw new Error(errorString);
  }
}
