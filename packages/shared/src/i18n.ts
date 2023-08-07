import { sanitizedEnv } from "./env.js";
import { logger } from "./logger.js";
import * as i18n from "i18next";
import I18NexFsBackend from "i18next-fs-backend";
import path from "node:path";
import url from "node:url";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));
const LOCALES_DIRECTORY = path.join(pathDirname, "../../../locales");

export const defaultLocale = sanitizedEnv.DEFAULT_LOCALE || "en";

try {
  await i18n.use(I18NexFsBackend).init({
    initImmediate: false,
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    preload: [defaultLocale],
    ns: ["bot", "web"],
    defaultNS: "bot",
    backend: {
      skipOnVariables: false,
      loadPath: `${LOCALES_DIRECTORY}/{{lng}}/{{ns}}.json`,
    },
  });

  logger.info("i18n-next has been initialized");
} catch (error) {
  if (error instanceof Error) throw new TypeError(`${error.message}`);
}

// Shortcut
export const t = i18n.t;
export default i18n;
