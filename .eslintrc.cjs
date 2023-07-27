/* eslint-disable unicorn/no-null */

/**
 * The main config
 * @type {Record<string, any>}
 */

module.exports = {
  root: true,

  /**
   * Environment options
   * @type {Record<string, boolean>}
   */

  env: {
    es6: true,
    amd: true,
    browser: true,
  },

  /**
   * ESLint parser options
   * @type {Record<string, any>}
   */

  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      jsx: true,
    },
  },

  /**
   * Plugins to enable
   * @type {Array<string>}
   */

  plugins: ["unicorn", "import", "prettier"],

  /**
   * Rules to extend
   * @type {Array<string>}
   */

  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/react",
    "plugin:node/recommended",
    "plugin:unicorn/recommended",
    "plugin:import/recommended",
    "plugin:import/react",
    "prettier",
  ],

  /**
   * Base rules
   * @type {Record<string, any>}
   */

  rules: {
    "consistent-this": ["warn", "self"],

    // === is always right
    "eqeqeq": ["warn", "smart"],

    // Let's not go insane
    "max-depth": ["warn", 8],
    "max-nested-callbacks": ["warn", 8],
    "no-array-constructor": "warn",

    // Cleans up comments
    "no-inline-comments": "warn",
    "spaced-comment": ["warn", "always"],

    // Lonely stuff is bad
    "no-lonely-if": "warn",
    "no-new-object": "warn",

    // Returns are already promises
    "no-return-await": "warn",

    // Doesn't work correctly
    "no-undef": "off",

    // Prevents stupid ternary use
    "no-unneeded-ternary": "warn",

    // Stop using fucking var, please
    "no-var": "error",

    // Don't pad blocks out
    "padded-blocks": ["warn", "never"],

    // Const should *always* be used for constant stuff
    "prefer-const": ["error", { destructuring: "any", ignoreReadBeforeAssign: false }],

    // Single quote users are weird
    "quotes": ["warn", "double", { avoidEscape: true, allowTemplateLiterals: false }],

    // Enable prettier warnings
    "prettier/prettier": "warn",

    // We're not publishing a package, so we don't need this
    "node/no-unpublished-import": ["off"],

    // Very finicky, can't seem to get it to function correctly
    "node/no-unsupported-features/es-syntax": ["off"],

    // Causes breakage with node:imports and .js in TS files
    "node/no-missing-import": ["off"],
    "import/no-unresolved": ["off"],

    // This setting is inconsistent
    "unicorn/filename-case": ["off"],
    "unicorn/prefer-module": "off",
    "unicorn/prevent-abbreviations": "off",

    // This is useless
    "unicorn/no-array-for-each": ["off"],
    "unicorn/consistent-function-scoping": ["off"],

    // Enables import order sorting
    "import/order": [
      "warn",
      {
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        groups: ["type", "internal", "parent", "sibling", "external", "builtin", "index", "object"],
      },
    ],
  },

  /**
   * Typescript overrides
   * @type {Record<string, any>[]}
   */

  overrides: [
    {
      /**
       * Filetypes to check
       * @type {string[]}
       */

      files: ["*.ts", "*.tsx"],

      /**
       * The parser to use
       * @type {string}
       */

      parser: "@typescript-eslint/parser",

      /**
       * TypeScript specific settings
       * @type {Record<string,any[]}
       */

      settings: {
        "import/parsers": {
          "@typescript-eslint/parser": [".ts", ".tsx"],
        },

        // Enables TypeScript import resolving
        "import/resolver": {
          typescript: {
            alwaysTryTypes: true,
          },
        },
      },

      /**
       * Plugins to use
       * @type {string[]}
       */

      plugins: ["@typescript-eslint", "prettier"],

      /**
       * Extensions to use
       * @type {string[]}
       */

      extends: ["plugin:@typescript-eslint/eslint-recommended", "plugin:@typescript-eslint/recommended", "plugin:import/typescript"],

      /**
       * Main TypeScript ESLint overrides
       * @type {Record<string, any>}
       */

      rules: {
        "no-undef": "off",
        "semi": "off",

        // This is pretty useless, IMHO
        "@typescript-eslint/explicit-module-boundary-types": "off",
        "@typescript-eslint/member-delimiter-style": "error",

        // Force strict member ordering
        "@typescript-eslint/member-ordering": "error",

        // Breaks some typings
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",

        // We don't make TS error on this, so enable it
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/type-annotation-spacing": "error",

        // Semi-explicit member accessibility
        "@typescript-eslint/explicit-member-accessibility": [
          "error",
          {
            accessibility: "no-public",
            overrides: {
              accessors: "explicit",
              methods: "explicit",
            },
          },
        ],

        // Naming convention
        "@typescript-eslint/naming-convention": [
          "warn",
          {
            selector: "default",
            format: ["camelCase"],
          },
          {
            selector: "variableLike",
            format: ["camelCase"],
          },
          {
            selector: "variable",
            format: ["camelCase", "UPPER_CASE", "PascalCase"],
          },
          {
            selector: "parameter",
            format: ["camelCase"],
            leadingUnderscore: "allow",
          },
          {
            selector: "memberLike",
            format: ["camelCase"],
          },
          {
            selector: "memberLike",
            modifiers: ["private"],
            format: ["camelCase"],
            leadingUnderscore: "require",
          },
          {
            selector: "typeParameter",
            format: ["PascalCase"],
            prefix: ["T"],
          },
          {
            selector: "interface",
            format: ["PascalCase"],
            custom: { regex: "^I[A-Z]", match: false },
          },
          {
            selector: "enumMember",
            format: ["UPPER_CASE"],
          },
          {
            selector: "objectLiteralProperty",
            format: null,
          },
          {
            selector: "typeLike",
            format: null,
          },
          {
            selector: "typeAlias",
            format: null,
          },
          {
            selector: "typeProperty",
            format: null,
          },
        ],
      },
    },
  ],
};
