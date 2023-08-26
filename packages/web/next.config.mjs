import { withSentryConfig } from "@sentry/nextjs";
import path from "node:path";
import url from "node:url";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));

/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Fixes a really annoying Next.JS bug that Vercel doesn't want to fix
    // https://github.com/vercel/next.js/discussions/32237#discussioncomment-4793595
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };

    return config;
  },

  sassOptions: {
    includePaths: [path.join(pathDirname, "src/scss")],
  },

  // TODO: Source mappings
  sentry: {
    hideSourceMaps: true,
  },
};

export default withSentryConfig(nextConfig);
