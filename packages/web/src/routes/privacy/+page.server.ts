import { HibikiPrivacyURL } from "$shared/constants.ts";
import { redirect } from "@sveltejs/kit";

export function load() {
  throw redirect(308, HibikiPrivacyURL);
}
