/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.cjs"],
  // ignorePatterns: [".eslintrc.cjs", "vite.config.mjs", "svelte.config.js"],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    // project: "./tsconfig.json",
    extraFileExtensions: [".svelte"],
  },

  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
      rules: {
        // Broken
        "no-inner-declarations": 0,
      },
    },
  ],
};
