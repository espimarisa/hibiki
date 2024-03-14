import type { Handle } from "@sveltejs/kit";

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
  Object.entries(securityHeaders).forEach(([header, value]) => response.headers.set(header, value));
  return response;
};
