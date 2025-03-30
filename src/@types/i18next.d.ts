/**
 * @file Typing extensions for i18next.
 * @author Espi Marisa <contact@espi.me>
 * @module @types/i18next.d.ts
 */

import type commands from "@/locales/en-US/commands.json";
import type common from "@/locales/en-US/common.json";

// Valid Hibiki dictionary keys
export type HIBIKI_DICTIONARY_KEYS =
	| `commands:${keyof typeof commands}`
	| `common:${keyof typeof common}`;

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		ns: ["common", "commands"];

		resources: {
			common: typeof common;
			commands: typeof commands;
		};
	}
}
