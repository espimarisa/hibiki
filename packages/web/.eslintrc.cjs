module.exports = {
  root: true,
  extends: ["plugin:svelte/recommended", "../../.eslintrc.cjs"],
  parserOptions: {
    project: ["./tsconfig.json", "../../tsconfig.json"],
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
};
