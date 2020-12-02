/**
 * @file Database
 * @description Base structure for database providers
 * @author Espi <contact@espi.me>
 */

import { hibikiClient } from "./Client";
const errorString = "Method not implemented.";

export class DatabaseProvider {
  bot: hibikiClient;

  /**
   * Creates a new database provider.
   * @param {hibikiClient} bot Main bot object
   *
   * @example new Database(this.bot);
   */

  constructor(bot: hibikiClient) {
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
