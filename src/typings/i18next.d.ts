/**
 * @file i18next
 * @description Type overrides for i18next.
 * @author Espi Marisa <contact@espi.me>
 */

import "i18next";

import type commands from "$locales/en/commands.json";
import type common from "$locales/en/common.json";

declare module "i18next" {
	interface CustomTypeOptions {
		defaultNS: "common";
		ns: ["commands", "common"];

		resources: {
			common: typeof common;
			commands: typeof commands;
		};
	}
}
