/**
 * @file i18nxs
 * @description Utilities for managing and using i18nxs localizations.
 */

import fs from "node:fs/promises";
import path from "node:path";
import I18XS from "i18xs";

// Dictionary type overrides
import type commandsDictionaryKeys from "$locales/en/commands.json";
import type commonDictionaryKeys from "$locales/en/common.json";
type HibikiDictionaryKeys =
	| `commands.${keyof typeof commandsDictionaryKeys}`
	| `common.${keyof typeof commonDictionaryKeys}`;

// An extended I18XS constructor full of valid keys from the en locale.
export interface I18XSExtended {
	t(k: HibikiDictionaryKeys, t?: Record<string, unknown>): string;
}

// Gets the locales directory and a list of locales in it
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../locales");
const SUPPORTED_LOCALES = await fs.readdir(LOCALES_DIRECTORY);

// Creates a new i18nxs manager
export const i18xs: I18XSExtended = new I18XS({
	currentLocale: "en",
	fallbackLocale: "en",
	localesDir: LOCALES_DIRECTORY,
	supportedLocales: SUPPORTED_LOCALES,
});
