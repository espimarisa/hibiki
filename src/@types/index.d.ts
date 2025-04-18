/**
 * @file Global typing definitions for internal modules.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** A valid localization dictionary key. */
type DictionaryKey = import("@/types/i18next.d.ts").DictionaryKey;

/** Typing for a Hibiki chat command. */
type HibikiChatCommandInteraction = {
  /** Slash command data. */
  data:
    | PrivateSlashCommandBuilder
    | PrivateSlashCommandSubcommandBuilder
    | PrivateSlashCommandSubcommandsOnlyBuilder;

  /**
   * Required environment variables needed in order to load the command.
   * @default []
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

/** Typing for a Hibiki event listener. */
type HibikiListener<K extends keyof PrivateClientEvents> = {
  /** The client event to handle. */
  event: K;

  /**
   * Only run the event listener the first time it is emitted.
   * @default false
   */

  once?: boolean;

  /**
   * Runs an event listener when an event listener is emitted.
   * @param args Arguments to pass to the handler.
   */

  runListener: (...args: PrivateClientEvents[K]) => Promise<void>;
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

/** Typing for possible Hibiki event handler types */
type HibikiListenerType = HibikiListener<keyof PrivateClientEvents>;

/** Typing for possible Hibiki command interaction types. */
type HibikiCommandInteraction = HibikiChatCommandInteraction;

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
