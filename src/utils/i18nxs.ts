/**
 * @file i18nxs
 * @description Utilities for managing and using i18nxs localizations.
 */

import fs from "node:fs/promises";
import path from "node:path";
import I18XS from "i18xs";

// Gets the locales directory and a list of locales in it
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../locales");
const SUPPORTED_LOCALES = await fs.readdir(LOCALES_DIRECTORY);

// Creates a new i18nxs manager
export const i18xs = new I18XS({
	currentLocale: "en",
	fallbackLocale: "en",
	localesDir: LOCALES_DIRECTORY,
	supportedLocales: SUPPORTED_LOCALES,
});
