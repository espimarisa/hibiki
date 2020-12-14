/**
 * @file Database
 * @description Base structure for database providers
 */

import { HibikiClient } from "./Client";
const errorString = "Method not implemented.";

export class DatabaseProvider {
  bot: HibikiClient;

  /**
   * Creates a new database provider.
   * @param {HibikiClient} bot Main bot object
   *
   * @example new Database(this.bot);
   */

  constructor(bot: HibikiClient) {
    this.bot = bot;
  }

  // Gets a server's config
  getGuildConfig(id: string): void {
    if (!id) throw new Error(errorString);
  }

  // Get's a user's config
  getUserConfig(id: string): void {
    if (!id) throw new Error(errorString);
  }
}
