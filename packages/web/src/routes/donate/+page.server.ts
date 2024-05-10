import { HibikiDonateURL } from "$shared/constants.ts";
import { redirect } from "@sveltejs/kit";

export function load() {
  throw redirect(308, HibikiDonateURL);
}
