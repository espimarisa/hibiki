import "$lib/i18n";

import { browser } from "$app/environment";
import { locale, waitLocale } from "svelte-i18n";

export const load = async () => {
  if (browser) {
    // Sets the locale to the user's preferred language
    locale.set(window.navigator.language);
  }

  await waitLocale();
};
