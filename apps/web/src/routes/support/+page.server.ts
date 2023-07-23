import { redirect } from "@sveltejs/kit";

export function load() {
  // TODO: Add a proper invite
  throw redirect(308, "https://google.com");
}
