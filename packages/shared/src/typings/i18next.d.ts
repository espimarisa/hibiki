import "i18next";

// Import all namespaces
import bot from "$locales/en-US/bot.json";

declare module "i18next" {
  // Extend CustomTypeOptions
  interface CustomTypeOptions {
    defaultNS: "bot";

    resources: {
      bot: typeof bot;
    };
  }
}
