import type { Metadata } from "next";

// Styles
import "$web/scss/index.scss";

import lng from "$locales/en/web.json";
import { sanitizedEnv } from "$shared/env.js";

export default function rootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

// Index page metadata
export const metadata: Metadata = {
  metadataBase: sanitizedEnv.isProduction ? new URL(sanitizedEnv.WEB_PRODUCTION_URL) : undefined,
  title: lng.TITLE,
  openGraph: {
    title: lng.TITLE,
    description: lng.TAGLINE,
  },
  twitter: {
    title: lng.TITLE,
    description: lng.TAGLINE,
    creator: "@espidotme",
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};
