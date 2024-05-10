// src/lib/i18n/index.ts
import { browser } from "$app/environment";
import { init, register } from "svelte-i18n";

// Should this be en-US?
const defaultLocale = "en-US";

// TODO: Make this load all locales in the folder instead of manually doing it
// TODO: Typings for the t() wrapper
register("en-US", () => import("../../../../locales/en-US/web.json"));

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? window.navigator.language : defaultLocale,
});
