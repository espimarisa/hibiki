import * as i18n from "i18next";
import i18NexFsBackend from "i18next-fs-backend";
import fs from "node:fs/promises";
import path from "node:path";

// __dirname replacement in ESM
const pathDirname = path.dirname(Bun.fileURLToPath(new URL(import.meta.url)));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../../locales");

// Inits i18next
await i18n
  .use(i18NexFsBackend)
  .init({
    initImmediate: false,
    fallbackLng: "en-US",
    load: "all",
    lng: "en-US",
    ns: ["bot"],
    defaultNS: "bot",
    preload: await getListOfLocales(),
    backend: {
      skipOnVariables: false,
      loadPath: `${LOCALES_DIRECTORY}/{{lng}}/{{ns}}.json`,
    },
  })
  .catch((error) => {
    throw new Error(Bun.inspect(error));
  });

// Returns an array of languages in the locales/ directory
export async function getListOfLocales() {
  const languages = await fs.readdir(LOCALES_DIRECTORY, { encoding: "utf8" });
  return languages;
}

// Shortcut for translate
export const t = i18n.t;
export default i18n;
