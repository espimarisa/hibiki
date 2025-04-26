/**
 * @file Global typing definitions.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** A valid locale dictionary key included in a localization file. */
type DictionaryKey = PrivateDictionaryKey;

/** A valid Hibiki Slash command. */
type HibikiSlashCommand = {
  /** Slash command data. */
  data:
    | PrivateSlashCommandBuilder
    | PrivateSlashCommandOptionsOnlyBuilder
    | PrivateSlashCommandSubcommandsOnlyBuilder;

  /**
   * Runs a slash command.
   * @param interaction The interaction to run the command on.
   */

  run: (interaction: PrivateChatInputCommandInteraction) => Promise<void>;
};

/** A valid Hibiki event listener. */
type HibikiEvent<K extends keyof PrivateClientEvents> = {
  /** The client event to listen on and handle. */
  event: K;

  /**
   * Only runs the listener on the first event emission (client.once).
   * @default false
   */

  once?: boolean;

  /**
   * Runs a listener.
   * @param args Client event arguments to pass to the handler.
   */

  handle: (...args: PrivateClientEvents[K]) => Promise<void>;
};

/** Global type alias for keyof ClientEvents. */
type HibikiListener = keyof PrivateClientEvents;

/** A valid Hibiki guild configuration structure. */
type HibikiGuildConfig = {
  /** The guild's unique Discord guild ID. **/
  guild_id: string;
};

/** A valid Hibiki user configuration structure. */
type HibikiUserConfig = {
  /** The user's unique Discord user ID. **/
  user_id: string;
};

// Private typing import aliases so global types function properly
type PrivateDictionaryKey = import("@typings/i18next.js").DictionaryKey;
type PrivateSlashCommandBuilder = import("discord.js").SlashCommandBuilder;
type PrivateClientEvents = import("discord.js").ClientEvents;
type PrivateChatInputCommandInteraction =
  import("discord.js").ChatInputCommandInteraction;
type PrivateSlashCommandOptionsOnlyBuilder =
  import("discord.js").SlashCommandOptionsOnlyBuilder;
type PrivateSlashCommandSubcommandsOnlyBuilder =
  import("discord.js").SlashCommandSubcommandsOnlyBuilder;
