import "i18next";

import type commands from "$locales/en-US/commands.json";
import type global from "$locales/en-US/global.json";

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "global";
    ns: ["commands", "global"];

    resources: {
      commands: typeof commands;
      global: typeof global;
    };
  }
}
