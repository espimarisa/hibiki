/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ["../../.eslintrc.cjs"],

  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      rules: {
        // Broken
        "no-inner-declarations": 0,
      },
    },
  ],
};
