/**
 * @file Validator
 * @description Utilities for verification and parsing
 * @module validator
 */

import { GatewayIntentsString, BitFieldResolvable, ClientOptions, IntentsBitField } from "discord.js";

/**
 * Checks to see if an intent is in config.options
 * @param options Client options
 * @param intentsToCheck An array of intents to check
 * @returns Either an array of missing intents or nothing
 */

export function checkIntents(options: ClientOptions, intentsToCheck: ResolvableIntentString[]) {
  // Creates a new bitfield out of the client's intents
  const bitfield: BitFieldResolvable<GatewayIntentsString, number> = options.intents ?? (options.ws as any)?.intents;
  if (!bitfield) return;

  // Creates a new intents constructor for comparison use
  const clientIntents = new IntentsBitField(bitfield);
  const missingIntents: ResolvableIntentString[] = [];

  // Checks each intent
  for (const intent of intentsToCheck) {
    // Pushes missing intents to the array
    if (!clientIntents.has(intent)) missingIntents.push(intent);
  }

  // Returns an array of missing intents
  return missingIntents;
}
