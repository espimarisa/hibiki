import "i18next";

// Import all namespaces
import bot from "$locales/en/bot.json";
import web from "$locales/en/web.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: "bot";

    resources: {
      bot: typeof bot;
      web: typeof web;
    };
  }
}
