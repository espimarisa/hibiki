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
};

export default nextConfig;
