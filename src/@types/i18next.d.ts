/**
 * @file Extended typing definitions for i18next.
 * @license zlib
 */

import type { ParseKeys } from "i18next";
import type booleans from "@/locales/en-US/booleans.json";
import type commands from "@/locales/en-US/commands.json";
import type common from "@/locales/en-US/common.json";
import type discord from "@/locales/en-US/discord.json";
import type errors from "@/locales/en-US/errors.json";
import type units from "@/locales/en-US/units.json";
import type { defaultNS, ns } from "@/utils/i18n.ts";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNS;
    ns: readonly typeof ns;
    returnNull: false;
    resources: {
      booleans: readonly typeof booleans;
      commands: readonly typeof commands;
      common: readonly typeof common;
      discord: readonly typeof discord;
      errors: readonly typeof errors;
      units: readonly typeof units;
    };
  }
}

/** A singular i18next Dictionary key identifier. */
export type DictionaryKey = ParseKeys<typeof ns, Record<never, never>, "">;
