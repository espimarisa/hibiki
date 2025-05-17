/**
 * @file Global typing aliases and definitions.
 * @license zlib
 */

/** biome-ignore-all lint/correctness/noUnusedVariables: Global typings file. */

// A singular i18next Dictionary key identifier.
type DictionaryKey = import("@/types/i18next.d.ts").DictionaryKey;

// Typing for a Hibiki chat input (slash) command.
type HibikiChatCommand = {
  /** Builds command data. */
  setData: () => ChatInputCommandData;

  /**
   * Runs a chat input (slash) command.
   * @param interaction The interaction to run the command on.
   */

  run: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

// Typing for a possible type of Hibiki command.
type HibikiCommand = HibikiChatCommand;

// Typing for a single client event.
type ClientEvent = keyof ClientEvents;

// Typing for a Hibiki event listener.
type HibikiListener<K extends keyof ClientEvents> = {
  /** The client event to handle. */
  event: K;

  /**
   * Only runs the handler on first emission.
   * @default false
   */

  once?: boolean;

  /**
   * Runs an event handler.
   * @param args Client event arguments.
   */

  handle: (...args: ClientEvents[K]) => Promise<void>;
};

/**
 * Inline typing imports to preserve global typing definition functionality.
 */

type ClientEvents = import("discord.js").ClientEvents;
type ChatInputCommandData =
  import("discord.js").RESTPostAPIChatInputApplicationCommandsJSONBody;
type ChatInputCommandInteraction =
  import("discord.js").ChatInputCommandInteraction;
