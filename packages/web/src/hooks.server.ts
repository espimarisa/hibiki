import type { Handle } from "@sveltejs/kit";
import { locale } from "svelte-i18n";

const securityHeaders = {
  "Cross-Origin-Embedder-Policy": "require-corp",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Permissions-Policy": "interest-cohort=()",
  "Referrer-Policy": "no-referrer",
  "Strict-Transport-Security": "max-age=15552000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-DNS-Prefetch-Control": "off",
  "X-Download-Options": "noopen",
  "X-Frame-Options": "SAMEORIGIN",
  "X-Permitted-Cross-Domain-Policies": "none",
  "X-XSS-Protection": "0",
};

export const handle: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  // Gets the user's locale
  const lang = event.request.headers.get("accept-language")?.split(",")[0];
  if (lang) {
    locale.set(lang);
  }

  // Sets security headers
  for (const [entry, value] of Object.entries(securityHeaders)) {
    response.headers.set(entry, value);
  }

  return response;
};
