/**
 * @file Global typing definitions for internal modules.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** A valid localization dictionary key. */
type DictionaryKey = import("@/types/i18next.d.ts").DictionaryKey;

/** Typing for a Hibiki slash command. */
type HibikiSlashCommand = {
  /** Slash command data. */
  data:
    | PrivateSlashCommandBuilder
    | PrivateSlashCommandSubcommandBuilder
    | PrivateSlashCommandSubcommandsOnlyBuilder;

  /**
   * Required environment variables needed in order to load the command.
   * @default undefined
   */

  required_env?: (keyof PrivateEnvironmentVariables)[];

  /**
   * Only the runner can view the interaction.
   * @default false
   */

  ephemeral?: boolean;

  /**
   * Defers the interaction, allowing for more processing time.
   * @default false
   */

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
  /** The client event to handle. */
  event: K;

  /**
   * Only run the event the first time it is emitted.
   * @default false
   */

  once?: boolean;

  /**
   * Runs am event when an event is emitted.
   * @param args Arguments to pass to the handler.
   */

  runEvent: (...args: PrivateClientEvents[K]) => Promise<void>;
};

/** Typing for a valid Hibiki guild config. */
type GuildConfig = {
  /** The guild's Discord guild ID. **/
  guild_id: PrivateSnowflake;
};

/** Typing for a valid Hibiki user config. */
type UserConfig = {
  /** The user's Discord user ID. **/
  user_id: PrivateSnowflake;
};

/** Shorthand type for all valid types of commands. */
type HibikiCommand = HibikiSlashCommand;

/** Typing for possible Hibiki event handler types */
type HibikiEventTypes = HibikiEventHandler<keyof PrivateClientEvents>;

// Private typing import aliases so global types function properly
type PrivateSlashCommandBuilder = import("discord.js").SlashCommandBuilder;
type PrivateClientEvents = import("discord.js").ClientEvents;
type PrivateChatInputCommandInteraction =
  import("discord.js").ChatInputCommandInteraction;
type PrivateSlashCommandSubcommandsOnlyBuilder =
  import("discord.js").SlashCommandSubcommandsOnlyBuilder;
type PrivateSlashCommandSubcommandBuilder =
  import("discord.js").PrivateSlashCommandSubcommandBuilder;
type PrivateEnvironmentVariables =
  import("@/utils/env.js").EnvironmentVariables;
type PrivateSnowflake = import("discord.js").Snowflake;
