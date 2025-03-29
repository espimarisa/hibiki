/**
 * @file Typing extensions for i18next.
 * @author Espi Marisa <contact@espi.me>
 * @module @types/i18next.d.ts
 */

import type commands from "@/locales/en/commands.json";
import type common from "@/locales/en/common.json";

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
