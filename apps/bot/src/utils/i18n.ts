import { sanitizedEnv } from "./env.js";
import { logger } from "./logger.js";
import * as i18n from "i18next";
import I18NexFsBackend from "i18next-fs-backend";

const defaultLocale = sanitizedEnv.DEFAULT_LOCALE ?? "en";

try {
  i18n.use(I18NexFsBackend).init({
    initImmediate: false,
    lng: defaultLocale,
    fallbackLng: defaultLocale,
    preload: [defaultLocale],
    ns: ["bot", "web"],
    defaultNS: "bot",
    backend: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
    },
  });
} catch (error) {
  throw new Error(`${error}`);
}

logger.info("i18n-next has been initialized");

// Shortcut
export const t = i18n.t;
export default i18n;
