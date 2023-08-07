import { redirect } from "@sveltejs/kit";

export function load() {
  // TODO: Add a proper invite
  redirect(308, "https://google.com");
}
