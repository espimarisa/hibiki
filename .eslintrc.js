/* 
  Optimized for Hibiki's coding style, not 100% perfect code.
  Most of these options try to keep our coding styles in-sync 
  as we all have slightly different ways of developing things.

  A few options are disabled as they either interfere with
  styling, or they interfere with unrelated functionality.
*/

// Easier to read
let OFF = 0,
  WARN = 1

module.exports = exports = {
  "env": {
    "es6": true,
    "amd": true
  },

  // Parser options
  extends: "eslint:recommended",
  parser: "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 6
  },

  "rules": {
    // Stylistic options - warn the user that it's bad
    "block-spacing": [WARN, "always"],
    "brace-style": [WARN, "1tbs", { allowSingleLine: true }],
    "comma-spacing": [WARN, { before: false, after: true }],
    "comma-style": [WARN, "last"],
    "computed-property-spacing": [WARN, "never"],
    "consistent-this": [WARN, "self"],
    "eol-last": WARN,
    "no-inline-comments": WARN,
    "jsx-quotes": [WARN, "prefer-double"],
    "lines-around-comment": [WARN, { beforeBlockComment: true }],
    "max-depth": [WARN, 8],
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
    "no-unneeded-ternary": WARN,
    "object-curly-spacing": [WARN, "always"],
    "operator-linebreak": [WARN, "after"],
    "padded-blocks": [WARN, "never"],
    "quote-props": [WARN, "consistent-as-needed"],
    "semi-spacing": [WARN, { before: false, after: true }],
    "space-before-blocks": [WARN, "always"],
    "space-in-parens": [WARN, "never"],
    "space-infix-ops": [WARN, { int32Hint: true }],
    "spaced-comment": [WARN, "always"],

    // Disabled - interfere with coding style or functionality
    "no-prototype-builtins": OFF,
    "no-undef": OFF,
    "no-empty": OFF,
  }
};
