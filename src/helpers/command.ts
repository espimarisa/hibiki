/**
 * @file Helpers for Hibiki commands.
 * @license zlib
 * @author Espi Marisa <contact@espi.me>
 */

import type {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandSubcommandsOnlyBuilder,
} from "discord.js";

/** A valid Hibiki Slash command. */
export type HibikiSlashCommand = {
  /** Slash command data. */
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
