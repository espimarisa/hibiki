/**
 * @file i18n
 * @description Utilities for i18n and localization.
 * @author Espi Marisa <contact@espi.me>
 */

import fs from "node:fs/promises";
import path from "node:path";
import i18n from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../locales");

// Returns an array of languages in the locales/ directory
async function getListOfLocales() {
	return await fs.readdir(LOCALES_DIRECTORY, { encoding: "utf8" });
}

// Inits i18next
await i18n
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
		load: "currentOnly",
		ns: ["commands", "common"],
		preload: await getListOfLocales(),
	})
	.catch((error) => {
		throw new Error(Bun.inspect(error));
	});

// Shortcut for i18n.t
export const t = i18n.t;
