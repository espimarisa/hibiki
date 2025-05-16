/**
 * @file Global typing definitions.
 * @license zlib
 */

/** biome-ignore-all lint/correctness/noUnusedVariables: Global typings file. */

// Typing for a Hibiki chat input (slash) command.
type HibikiChatCommand = {
  /** Expected command data. */
  data:
    | PSlashCommandBuilder
    | PSlashCommandOptionsOnlyBuilder
    | PSlashCommandSubcommandsOnlyBuilder;

  /**
   * Runs a chat input (slash) command.
   * @param interaction The interaction to run the command on.
   */

  run: (interaction: PChatInputCommandInteraction) => Promise<void>;
};

// Typing for a possible type of Hibiki command.
type HibikiCommand = HibikiChatCommand;

// Typing for a possible Hibiki client event.
type HibikiEvent = keyof PClientEvents;

// Typing for a Hibiki event listener.
type HibikiListener<K extends keyof PClientEvents> = {
  /** The client event to handle. */
  event: K;

  /**
   * Only run the handler on first emission.
   * @default false
   */

  once?: boolean;

  /**
   * Runs an event handler.
   * @param args Client event arguments.
   */

  handle: (...args: PClientEvents[K]) => Promise<void>;
};

/**
 * Inline typing imports to preserve global typing definition functionality.
 */

type PClientEvents = import("discord.js").ClientEvents;
type PChatInputCommandInteraction =
  import("discord.js").ChatInputCommandInteraction;
type PSlashCommandBuilder = import("discord.js").SlashCommandBuilder;
type PSlashCommandOptionsOnlyBuilder =
  import("discord.js").SlashCommandOptionsOnlyBuilder;
type PSlashCommandSubcommandsOnlyBuilder =
  import("discord.js").SlashCommandSubcommandsOnlyBuilder;
