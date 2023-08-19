import { HibikiInviteURI } from "$shared/constants.js";
import { RedirectType } from "next/dist/client/components/redirect.js";
import { redirect } from "next/navigation.js";

export default function page() {
  return redirect(HibikiInviteURI, RedirectType.push);
}
