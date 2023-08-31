import adapter from "@sveltejs/adapter-node";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  preprocess: [vitePreprocess({})],

  kit: {
    alias: {
      $web: "./src",
      $shared: "../shared/src",
    },

    adapter: adapter(),
  },
};

export default config;
