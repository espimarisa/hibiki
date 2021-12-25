/**
 * @file Intents
 * @description Utilities for intent verification and parsing
 * @module utils/intents
 */

import { BitFieldResolvable, ClientOptions, Intents, IntentsString } from "discord.js";

/**
 * Checks to see if an intent is in config.options
 * @param options Client options
 * @param intentsToCheck An array of intents to check
 * @returns Either an array of missing intents or nothing
 */

export function checkIntent(options: ClientOptions, intentsToCheck: ResolvableIntentString[]) {
  // Creates a new bitfield out of the client's intents
  const bitfield: BitFieldResolvable<IntentsString, number> = options.intents ?? (options.ws as any)?.intents;
  if (!bitfield) return;

  // Creates a new intents constructor for comparison use
  const clientIntents = new Intents(bitfield);
  const missingIntents: ResolvableIntentString[] = [];

  // Checks each intent
  intentsToCheck.forEach((intent) => {
    // Pushes missing intents to the array
    if (!clientIntents.has(intent)) missingIntents.push(intent);
  });

  return missingIntents;
}
