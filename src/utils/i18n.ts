/**
 * @file Utilities to perform i18n and l10n with i18next.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/i18n
 */

import { getDirname } from "@/utils/fs.js";
import { loaderLogger } from "@/utils/logger.js";
import i18n from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";
import fs from "node:fs/promises";
import path from "node:path";

// Gets the locales directory and each locale
const CURRENT_DIRECTORY = getDirname(import.meta.url);
const LOCALES_DIRECTORY = path.join(CURRENT_DIRECTORY, "../../locales");
const LOCALES_ARRAY = await fs.readdir(LOCALES_DIRECTORY);

// Initializes i18next
i18n
	.use(i18NexFsBackend)
	.init<FsBackendOptions>({
		backend: {
			loadPath: `${LOCALES_DIRECTORY}/{{lng}}/{{ns}}.json`,
		},
		defaultNS: "common",
		fallbackLng: "en",
		initImmediate: false,
		interpolation: {
			skipOnVariables: false,
		},
		lng: "en",
		load: "languageOnly",
		ns: ["commands", "common"],
		preload: LOCALES_ARRAY,
	})
	.catch((error) => {
		loaderLogger.error("Error while starting i18next:");
		throw new Error(Bun.inspect(error));
	});

// i18n translate function shorthand
export const t = i18n.t;
