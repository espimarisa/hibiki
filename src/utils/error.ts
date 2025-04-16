/**
 * @file Utilities to interact with and handle errors.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

/** biome-ignore-all lint/nursery/noProcessGlobal: Bun's process.on() is different from node:process.on */

import { HibikiColors } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { logger } from "@/utils/logger.js";
import { type BunOptions, captureException, captureMessage } from "@sentry/bun";
import { type CommandInteraction, EmbedBuilder } from "discord.js";
import { init, t } from "i18next";

const errorFallback = "Unknown";
let sentryConnection = false;

/**
 * Initializes Sentry and connects to a DSN.
 * @param dsn The Sentry DSN to connect to.
 * @param options Additional Sentry client options.
 */

export function initSentry(dsn: string, options?: BunOptions) {
  if (!dsn) {
    return;
  }

  // Connect to sentry
  try {
    init({
      dsn: dsn,
      tracesSampleRate: env.NODE_ENV === "development" ? 1.0 : 0.2,
      ...options,
    });

    sentryConnection = true;
    logger.info(`Sentry connected to DSN ${dsn}`);

    // Capture errors; wait until on() is connected
    if (typeof process.on === "function") {
      // Catch unhandledRejections and capture them if connected
      process.on("unhandledRejection", (reason) => {
        captureError(reason);
      });

      // Catch uncaughtExceptions and capture them if connected
      process.on("uncaughtException", (err) => {
        captureError(err);
      });
    }
  } catch (err) {
    const error = parseError(err);
    logger.error(`Error initializing Sentry: ${error.message}`);
  }
}

/**
 * Captures an error and sends it to Sentry.
 * @param err The error object to capture.
 * @param context Additional context to supply.
 */

export function captureError(
  err: Error | unknown,
  context?: Record<string, unknown>,
) {
  if (sentryConnection) {
    if (err instanceof Error) {
      captureException(err, context ? { extra: context } : undefined);
    } else {
      captureMessage(String(err), context ? { extra: context } : undefined);
    }
  }
}

/**
 * Parses a possible error object and returns an Error object.
 * @param error A possible error object to parse.
 * @returns A valid Error instance.
 */

export function parseError(error: unknown) {
  // Returns the Error object if it is one
  if (error instanceof Error) {
    return error;
  }

  let message = errorFallback;

  // Handles errors that only return a string
  if (typeof error === "string") {
    message = error;
  } else if (
    // Handles non-Error objects
    typeof error === "object" &&
    error !== null &&
    "message" in error
  ) {
    // Inspect the object and get the message
    message = Bun.inspect((error as { message: unknown }).message);
  } else {
    // Build the object
    message = Bun.inspect(error);
  }

  // Preserve the error.cause if it exists
  const cause =
    typeof error === "object" && error !== null
      ? Bun.inspect(error)
      : undefined;

  // Returns a valid Error object and appends the cause
  return new Error(message, cause ? { cause } : undefined);
}

/**
 * Sends an error reply to an interaction.
 * @param interaction The interaction to send the error message to.
 * @param key The key to use for the description.
 * @param defer If set, sends a followUp() instead of a reply().
 * @param ephemeral If set, sends the reply to just the runner.
 * @param opts Additional options to pass to i18next.
 */

export async function sendErrorReply(
  interaction: CommandInteraction,
  key: DictionaryKey,
  defer = false,
  ephemeral = false,
  opts: Record<string, unknown> = {},
) {
  // Creates the embed
  const flags = ephemeral ? "Ephemeral" : undefined;
  const embed = new EmbedBuilder();
  embed
    .setTitle(t("errors:ERROR_FATAL", { lng: interaction.locale }))
    .setDescription(t(key, { ...opts, lng: interaction.locale }))
    .setColor(HibikiColors.Error)
    .setFooter({
      "iconURL": interaction.user.client.user.displayAvatarURL(),
      "text": t("errors:ERROR_BUG", { lng: interaction.locale }),
    });

  // Sends the error message
  try {
    if (defer) {
      await interaction.followUp({
        flags: flags,
        embeds: [embed],
      });
    } else {
      await interaction.reply({
        flags: flags,
        embeds: [embed],
      });
    }
  } catch (err) {
    const error = parseError(err);
    logger.error(`Failed to send error reply: ${error.message}`);

    // Captures the error with sentry
    captureError(error, {
      interaction: interaction.id,
    });
  }

  return;
}
