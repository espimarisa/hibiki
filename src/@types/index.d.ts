/**
 * @file Typing definitions for internal modules.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** A valid localization dictionary key. */
type DictionaryKey = import("@/types/i18next.d.ts").DictionaryKey;

/** Typing for a Hibiki slash command. */
type HibikiSlashCommand = {
  data:
    | PrivateSlashCommandBuilder
    | PrivateSlashCommandSubcommandBuilder
    | PrivateSlashCommandSubcommandsOnlyBuilder;

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

  runCommand: (
    interaction: PrivateChatInputCommandInteraction,
  ) => Promise<void>;
};

/** Typing for a Hibiki event handler. */
type HibikiEvent<K extends keyof PrivateClientEvents> = {
  /** The client event to listen on. */
  event: K;

  /** If set, only runs the event once. Defaults to false. */
  once?: boolean;

  /**
   * Runs am event when an event is emitted.
   * @param args Arguments to pass to the handler.
   */

  runEvent: (...args: PrivateClientEvents[K]) => Promise<void>;
};

/** Typing for a valid Hibiki guild config. */
type GuildConfig = {
  /** The guild's ID. */
  guild_id: string;
};

/** Typing for a valid Hibiki user config. */
type UserConfig = {
  /** The user's Discord ID. */
  user_id: string;
};

/** Shorthand type for all valid types of commands. */
type HibikiCommand = HibikiSlashCommand;

/** Typing for possible Hibiki event handler types */
type HibikiEventTypes = HibikiEventHandler<keyof PrivateClientEvents>;

// Type import aliases so global types are happy
type PrivateSlashCommandBuilder = import("discord.js").SlashCommandBuilder;
type PrivateClientEvents = import("discord.js").ClientEvents;
type PrivateChatInputCommandInteraction =
  import("discord.js").ChatInputCommandInteraction;
type PrivateSlashCommandSubcommandsOnlyBuilder =
  import("discord.js").SlashCommandSubcommandsOnlyBuilder;
type PrivateSlashCommandSubcommandBuilder =
  import("discord.js").PrivateSlashCommandSubcommandBuilder;
