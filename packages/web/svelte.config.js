import { vitePreprocess } from "@sveltejs/kit/vite";
import adapter from "svelte-adapter-bun";

/** @type {import("@sveltejs/kit").Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  preprocess: [vitePreprocess({})],

  kit: {
    alias: {
      $web: "./src",
    },

    adapter: adapter(),
  },
};

export default config;
