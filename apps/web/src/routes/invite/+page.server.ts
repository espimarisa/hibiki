import { redirect } from "@sveltejs/kit";

export function load() {
  // TODO: Not hardcode this
  throw redirect(
    308,
    "https://discord.com/oauth2/authorize?&client_id=493904957523623936&scope=bot%20applications.commands&permissions=28307378007798",
  );
}
