module.exports = {
  env: {
    es6: true,
    amd: true,
  },

  ignorePatterns: ["docs/", "dist/", "out/", "rethinkdb_data/", "node_modules/"],
  extends: "eslint:recommended",
  parser: "babel-eslint",
  parserOptions: {
    ecmaVersion: 2020,
  },

  rules: {
    "block-spacing": [1, "always"],
    "brace-style": [1, "1tbs", { allowSingleLine: true }],
    "comma-dangle": [1, "always-multiline"],
    "comma-spacing": [1, { before: false, after: true }],
    "comma-style": [1, "last"],
    "computed-property-spacing": [1, "never"],
    "consistent-this": [1, "self"],
    "eol-last": 1,
    "eqeqeq": [1, "smart"],
    "no-inline-comments": 1,
    "jsx-quotes": [1, "prefer-double"],
    "lines-around-comment": [1, { beforeBlockComment: false }],
    "max-depth": [1, 8],
    "max-len": [1, { code: 150, ignoreComments: true, ignoreStrings: true, tabWidth: 2 }],
    "max-nested-callbacks": [1, 8],
    "max-params": [1, 8],
    "new-parens": 1,
    "no-array-constructor": 1,
    "no-lonely-if": 1,
    "no-mixed-spaces-and-tabs": 1,
    "no-multiple-empty-lines": 1,
    "no-new-object": 1,
    "no-spaced-func": 1,
    "no-trailing-spaces": 1,
    "no-return-await": 1,
    "no-undef": 0,
    "no-unneeded-ternary": 1,
    "object-curly-spacing": [1, "always"],
    "operator-linebreak": [1, "after"],
    "padded-blocks": [1, "never"],
    "prefer-const": ["error", { destructuring: "any", ignoreReadBeforeAssign: false }],
    "quotes": [1, "double", { avoidEscape: true, allowTemplateLiterals: true }],
    "quote-props": [1, "consistent-as-needed"],
    "semi": [1, "always"],
    "semi-spacing": [1, { before: false, after: true }],
    "space-before-blocks": [1, "always"],
    "space-in-parens": [1, "never"],
    "space-infix-ops": [1, { int32Hint: true }],
    "spaced-comment": [1, "always"],
  },
};
