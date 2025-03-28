/**
 * @file Utilities to perform i18n and l10n with i18next.
 * @author Espi Marisa <contact@espi.me>
 * @module utils/i18n
 */

import fs from "node:fs/promises";
import path from "node:path";
import { getDirname } from "@/utils/fs.ts";
import i18n from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

// Gets the LOCALES_DIRECTORY to load
const currentFolder = getDirname(import.meta.url);
const LOCALES_DIRECTORY = path.join(currentFolder, "../../locales");

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
		preload: await fs.readdir(LOCALES_DIRECTORY, { encoding: "utf8" }),
	})
	.catch((error) => {
		throw new Error(Bun.inspect(error));
	});

// Shortcut for i18n.t
export const t = i18n.t;
