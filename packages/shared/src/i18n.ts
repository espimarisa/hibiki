import fs from "node:fs/promises";
import path from "node:path";

import * as i18n from "i18next";
import i18NexFsBackend from "i18next-fs-backend";

import { env } from "$shared/env.ts";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(new URL(import.meta.url) as URL));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../../locales");

// Inits i18next
await i18n
  .use(i18NexFsBackend)
  .init({
    initImmediate: false,
    fallbackLng: env.DEFAULT_LOCALE,
    load: "all",
    lng: env.DEFAULT_LOCALE,
    ns: ["bot"],
    defaultNS: "bot",
    preload: await getListOfLocales(),
    interpolation: {
      skipOnVariables: false,
    },
    backend: {
      skipOnVariables: false,
      loadPath: `${LOCALES_DIRECTORY}/{{lng}}/{{ns}}.json`,
    },
  })
  .catch((error: unknown) => {
    throw new Error(Bun.inspect(error));
  });

// Returns an array of languages in the locales/ directory
export async function getListOfLocales() {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const languages = await fs.readdir(LOCALES_DIRECTORY, { encoding: "utf8" });
  return languages;
}

// Shortcut for translate
export const t = i18n.t;
export { i18n };
