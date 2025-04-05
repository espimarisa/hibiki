/**
 * @file Typing file for internal Hibiki modules.
 * @author Espi Marisa <contact@espi.me>
 * @module @types/index.d.ts
 */

// Type import aliases so global types are happy
type SlashCommandBuilder = import("discord.js").SlashCommandBuilder;
type ClientEvents = import("discord.js").ClientEvents;
type ChatInputCommandInteraction =
  import("discord.js").ChatInputCommandInteraction;

/** Typing alias for an i18next valid dictionary key.  */
type DictionaryKey = import("@/types/i18next.d.ts").DictionaryKey;

/** Typing for a Hibiki slash command. */
type HibikiSlashCommand = {
  data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

  /** An optional array of required env vars in .env needed to load a command. */
  env_vars?: string[];

  /** If set, only the runner can see the command. Defaults to false. */
  ephemeral?: boolean;

  /** If set, defer the interaction to allow for more processing time. Defaults to false. */
  defer?: boolean;

  /**
   * Runs a chat input (slash) command.
   * @param interaction The interaction to run the command on.
   */

  runCommand: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

/** Typing for a Hibiki event handler. */
type HibikiEventHandler<K extends keyof ClientEvents> = {
  /** The client event to listen on. */
  event: K;

  /** If set, only runs the event once. Defaults to false. */
  once?: boolean;

  /**
   * Runs a handler when an event is emitted.
   * @param args Arguments to pass to the handler.
   */

  runHandler: (...args: ClientEvents[K]) => Promise<void>;
};

/** Typing for possible Hibiki event handler types */
type HibikiEventHandlerTypes = HibikiEventHandler<keyof ClientEvents>;
