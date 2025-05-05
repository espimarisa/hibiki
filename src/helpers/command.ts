/**
 * @file Helpers for Hibiki commands.
 * @license Zlib

 */

import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/** A valid Hibiki command. */
export type HibikiCommand = {
  /** Expected command data. */
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

  /**
   * Runs a slash command.
   * @param interaction The interaction to run the command on.
   */

  run: (interaction: ChatInputCommandInteraction) => Promise<void>;
};
