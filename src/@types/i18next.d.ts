/**
 * @file Additional typing definitions for i18next.
 * @author Espi Marisa <contact@espi.me>
 * @module @types/i18next
 */

import type command from "@/locales/en-US/command.json";
import type common from "@/locales/en-US/common.json";
import type error from "@/locales/en-US/error.json";

// Valid dictionary keys
export type DictionaryKey =
	| `command:${keyof typeof command}`
	| `common:${keyof typeof common}`
	| `error:${keyof typeof error}`;

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		ns: ["command", "common", "error"];

		resources: {
			command: typeof command;
			common: typeof common;
			error: typeof error;
		};
	}
}
