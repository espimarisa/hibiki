import "i18next";
import type api from "$locales/en-US/api.json";
import type booleans from "$locales/en-US/booleans.json";
import type commands from "$locales/en-US/commands.json";
import type empty from "$locales/en-US/empty.json";
import type errors from "$locales/en-US/errors.json";
import type global from "$locales/en-US/global.json";
import type time from "$locales/en-US/time.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "empty";
    ns: ["api", "booleans", "commands", "errors", "global", "time"];

    resources: {
      api: typeof api;
      booleans: typeof booleans;
      commands: typeof commands;
      errors: typeof errors;
      empty: typeof empty;
      global: typeof global;
      time: typeof time;
    };
  }
}
