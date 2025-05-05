/**
 * @file Utilities interacting with and handling errors.
 * @license Zlib

 */

/** biome-ignore-all lint/nursery/noProcessGlobal: Bun's process.on() is different from node:process.on. */

import { env } from "@/root/utils/env.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { logger } from "@/utils/logger.ts";
import { type BunOptions, captureException, captureMessage } from "@sentry/bun";
import {
  type CommandInteraction,
  EmbedBuilder,
  MessageFlags,
} from "discord.js";
import { init, t } from "i18next";
import type { DictionaryKey } from "../@types/i18next.ts";

const errorFallbackMessage = "Unknown";
let sentryConnected = false;

/**
 * Initializes Sentry and connects to a DSN.
 * @param dsn The Sentry DSN to connect to.
 * @param options Additional Sentry client options.
 */

export function initSentry(dsn: string, options?: BunOptions) {
  if (!dsn) {
    return;
  }

  try {
    init({
      dsn,
      tracesSampleRate: env.NODE_ENV === "development" ? 1.0 : 0.2,
      ...options,
    });

    sentryConnected = true;
    logger.info(`Sentry connected to DSN ${dsn}`);

    // Capture all errors that are not manually caught.
    if (typeof process.on === "function") {
      process.on("unhandledRejection", captureError);
      process.on("uncaughtException", captureError);
    }
  } catch (err) {
    logger.error(`Error initializing Sentry: ${parseError(err).message}`);
  }
}

/**
 * Captures an error and sends it to Sentry.
 * @param err The error object to capture.
 * @param context Additional context to supply to Sentry.
 */

export function captureError(err: unknown, context?: Record<string, unknown>) {
  if (!sentryConnected) {
    return;
  }

  if (err instanceof Error) {
    captureException(err, context ? { extra: context } : undefined);
  } else {
    captureMessage(String(err), context ? { extra: context } : undefined);
  }
}

/**
 * Parses a possible error object and returns an Error object.
 * @param error A possible error object to parse.
 * @returns A valid Error instance.
 */

export function parseError(error: unknown): Error {
  let message = errorFallbackMessage;

  if (error instanceof Error) {
    return error;
  }

  // Parses string-only errors.
  if (typeof error === "string") {
    message = error;
  } else if (
    // Parses objects with "error" inside of them.
    error !== null &&
    typeof error === "object" &&
    "message" in error
  ) {
    // Extracts the message from a message object.
    message = Bun.inspect((error as { message: unknown }).message);
  } else {
    message = Bun.inspect(error);
  }

  // Generates the error cause.
  const cause =
    typeof error === "object" && error !== null
      ? Bun.inspect(error)
      : undefined;

  // Returns the error.
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
  const flags: MessageFlags | undefined = ephemeral
    ? MessageFlags.Ephemeral
    : undefined;

  const embed = new EmbedBuilder()
    .setTitle(t("errors:ERROR", { lng: interaction.locale }))
    .setDescription(t(key, { ...opts, lng: interaction.locale }))
    .setColor(HibikiColors.Error)
    .setFooter({
      iconURL: interaction.client.user.displayAvatarURL(),
      text: t("errors:ERROR_BUG", { lng: interaction.locale }),
    });

  try {
    // Creates the message to send.
    const message = {
      flags: flags,
      embeds: [embed],
    };

    if (defer) {
      // Follow up to deferred interactions.
      await interaction.followUp(message);
    } else {
      // Reply to interactions.
      await interaction.reply(message);
    }
  } catch (err) {
    const error = parseError(err);
    logger.error(`Failed to send error reply: ${error.message}`);
    captureError(error, { interaction: interaction.id });
  }
}
