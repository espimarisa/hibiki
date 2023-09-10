import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import path from "node:path";
import url from "node:url";

// __dirname replacement in ESM
const pathDirname = path.dirname(url.fileURLToPath(import.meta.url));
const ROOT_DIRECTORY = path.join(pathDirname, "../../");

/** @type {import("vite").defineConfig} */
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
