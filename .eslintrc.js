const OFF = 0,
  WARN = 1;

module.exports = exports = {
  env: {
    es6: true,
    amd: true,
  },

  // Ignores
  ignorePatterns: ["dist/", "rethinkdb_data/", "node_modules/"],

  // Parser options
  extends: "eslint:recommended",
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 6,
  },

  rules: {
    // Stylistic options
    "block-spacing": [WARN, "always"],
    "brace-style": [WARN, "1tbs", { allowSingleLine: true }],
    "comma-dangle": [WARN, "always-multiline"],
    "comma-spacing": [WARN, { before: false, after: true }],
    "comma-style": [WARN, "last"],
    "computed-property-spacing": [WARN, "never"],
    "consistent-this": [WARN, "self"],
    "eol-last": WARN,
    "eqeqeq": [WARN, "smart"],
    "no-inline-comments": WARN,
    "jsx-quotes": [WARN, "prefer-double"],
    "lines-around-comment": [WARN, { beforeBlockComment: true }],
    "max-depth": [WARN, 8],
    "max-len": [WARN, { code: 180, ignoreComments: true, ignoreStrings: true, tabWidth: 2 }],
    "max-nested-callbacks": [WARN, 8],
    "max-params": [WARN, 8],
    "new-parens": WARN,
    "no-array-constructor": WARN,
    "no-lonely-if": WARN,
    "no-mixed-spaces-and-tabs": WARN,
    "no-multiple-empty-lines": WARN,
    "no-new-object": WARN,
    "no-spaced-func": WARN,
    "no-trailing-spaces": WARN,
    "no-undef": OFF,
    "no-unneeded-ternary": WARN,
    "object-curly-spacing": [WARN, "always"],
    "operator-linebreak": [WARN, "after"],
    "padded-blocks": [WARN, "never"],
    "prefer-const": ["error", { destructuring: "any", ignoreReadBeforeAssign: false }],
    "quotes": [WARN, "double", { avoidEscape: true, allowTemplateLiterals: true }],
    "quote-props": [WARN, "consistent-as-needed"],
    "semi": [WARN, "always"],
    "semi-spacing": [WARN, { before: false, after: true }],
    "space-before-blocks": [WARN, "always"],
    "space-in-parens": [WARN, "never"],
    "space-infix-ops": [WARN, { int32Hint: true }],
    "spaced-comment": [WARN, "always"],
  },
};
