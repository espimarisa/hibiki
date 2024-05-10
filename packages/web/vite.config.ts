import path from "node:path";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// __dirname replacement in ESM
const pathDirname = path.dirname(import.meta.url);
const ROOT_DIRECTORY = path.join(pathDirname, "../../");

/** @type {import("vite").defineConfig} */
// biome-ignore lint/style/noDefaultExport: Vite configs require default exports
export default defineConfig({
  plugins: [sveltekit()],
  envDir: ROOT_DIRECTORY,

  css: {
    preprocessorOptions: {
      scss: {
        quietDeps: true,
        additionalData: '@use "src/scss/variables.scss" as *;',
      },
    },
  },
});
