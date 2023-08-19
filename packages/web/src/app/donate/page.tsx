import { RedirectType } from "next/dist/client/components/redirect.js";
import { redirect } from "next/navigation.js";

export default function page() {
  return redirect("https://github.com/sponsors/espimarisa", RedirectType.push);
}
