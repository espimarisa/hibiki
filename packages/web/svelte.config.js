import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import adapter from "svelte-adapter-bun";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  preprocess: [vitePreprocess({})],

  kit: {
    csp: {
      mode: "auto",
      directives: {
        "default-src": ["self"],
        "upgrade-insecure-requests": true,
      },
    },

    alias: {
      $web: "./src",
      $shared: "../shared/src",
    },

    adapter: adapter(),
  },
};

// biome-ignore lint/style/noDefaultExport: Svelte's configuration requires a default export
export default config;
