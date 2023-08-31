import { redirect } from "@sveltejs/kit";

export function load() {
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw redirect(308, "https://github.com/espimarisa/hibiki");
}
