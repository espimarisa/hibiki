import fs from "node:fs/promises";
import path from "node:path";
import type commands from "$locales/en-US/commands.json";
import { env } from "$shared/env.ts";
import i18n from "i18next";
import i18NexFsBackend, { type FsBackendOptions } from "i18next-fs-backend";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(import.meta.url));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../../locales");

// Returns an array of languages in the locales/ directory
async function getListOfLocales() {
  const languages = await fs.readdir(LOCALES_DIRECTORY, { encoding: "utf8" });
  return languages;
}

// Inits i18next
await i18n
  .use(i18NexFsBackend)
  .init<FsBackendOptions>({
    defaultNS: "empty",
    initImmediate: false,
    fallbackLng: env.DEFAULT_LOCALE,
    load: "currentOnly",
    lng: env.DEFAULT_LOCALE,
    ns: ["api", "booleans", "commands", "empty", "errors", "global", "time"],
    preload: await getListOfLocales(),
    interpolation: {
      skipOnVariables: false,
    },
    backend: {
      loadPath: `${LOCALES_DIRECTORY}/{{lng}}/{{ns}}.json`,
    },
  })
  .catch((error: unknown) => {
    throw new Error(Bun.inspect(error));
  });

// Generates an object of localization for a specific string
export async function getLocalizationsForKey(string: keyof typeof commands, lowercase = false, regex?: RegExp) {
  const locales = await getListOfLocales();

  // Tests against a regex provided
  if (regex) {
    const regexResults = regex.exec(string);
    if (!regexResults) {
      return;
    }
  }

  // Returns an object of all localizations related to a key
  return Object.fromEntries(
    locales.map((locale) => [
      locale,
      lowercase ? t(string, { lng: locale }).toLowerCase() : t(string, { lng: locale }),
    ]),
  );
}

// Shortcut for translate
export const t = i18n.t;
export { i18n };
