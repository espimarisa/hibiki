import { redirect } from "@sveltejs/kit";

export function load() {
  // TODO: Add a Crowdin URL or something.
  throw redirect(308, "https://github.com/espimarisa/hibiki");
}
