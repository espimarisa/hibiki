import { HibikiLicenseURL } from "$shared/constants.js";
import { redirect } from "@sveltejs/kit";

export function load() {
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw redirect(308, HibikiLicenseURL);
}
