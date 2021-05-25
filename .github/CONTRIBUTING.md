# Contributing

Here's a pretty cohesive list of guidelines you should try and stick to.

# TL;DR

- Respect our linter/compiler. You can use @ts-expect-error or // eslint-disable if you really need to, but it isn't preferred.
- Add a string following our naming convention in `src/locales/en.json` if you need to.
- Don't rely on external dependencies for simple things that we can create ourselves.
- If you're translating and the word doesn't exist in your language, you should either leave it as-is or reword it. View the translation guide for more details.
- Keep your commit/issue/PR messages clean. Follow semantic commits to the best of your ability. Don't flame or harass others. Don't beg for things.

# Translation Guide

1. Navigate to https://translate.hibiki.app.
2. On the homepage, select the language you'd like to work on.
   1. If you don't see your language listed, message a developer or make an issue and it'll be added quickly.
3. In the file listing and select `en.json`.
4. Select en.json and sign up/sign in to Crowdin. If you don't have an account, GitHub integration is fast.
5. Start navigating through any strings that are red or incomplete. The content on the top is the source, and the content on the bottom is what you should write.
   1. For the name, choose how your language is said in said language. `Example: Deutsch (German)`
   2. For the "EMOJI", either use the unicode flag for the country code, or leave it as-is.
   3. Do not translate anything that is highlighted by Crowdin. These are our variables.
   4. Do not translate markdown URLs (items enclosed in () between []). You can translate markdown text, though.
      1. Example: Translate `[thisItem](butNotThisItem)`. Be sure to keep the [] and () next to each other.
   5. When translating, copy and paste any emojis that are included in the string. We try and keep these at a minimum, but please preserve them.
   6. Our plural system handles things in a very simple way. The first content is the variable. Don't touch this.
      1. The second content is the word that will show when there's anything but one of something. Additionally, we may use this to display different strings. You can translate these normally. Example: `{type:#text#voice#!}`.
      2. The third content is the word that will show when there's only one of something.
      3. Example: `{variable:#pluralForm#!singularForm!}`
   7. Additionally, if your language has 3 or more plural forms (such as Czech), you can add the others after the second one. Be sure to add an additional ? after the !.
      1. Example: `{variable:#pluralForm#!singularForm!?optional_for_languages_with_multiple_pluralities?}`

# Source Contributions

We probably won't outright reject a PR if it doesn't follow these guidelines, but please try and stick to them. It makes our job a lot easier.

1. Follow our existing linter/style guide. While annoying to some, it's pretty strict. (If you're using Visual Studio Code, you can [install the ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) to make your job easier!)

2. Respect existing eslint/tsconfig options; don't disable anything in those files.

3. You can use @ts-expect-error or // eslint-disable if absolutely needed, but we like to remove those and fix the problem.

4. When importing a value that's only used as a type, use `import type`. TSC will warn you if you do otherwise.

5. When exporting a new module, don't do `export default name`. Instead, do `export name`.

   1. Example: `export ExampleClass` over `export default ExampleClass`

6. Follow our naming schemes for functions, constants, classes, etc to the best of your ability. The linter should warn you about them.

7. Try and use reasonable variable names. It's much easier to refactor something that's documented well and has meaningful variable names than just `a` or `b`.

8. When adding a new string, update it in `src/locales/en.json` **only**. Try and follow our naming scheme.

9. When referencing a string, put any emoji it may use before it. This makes translations easier as there's no extra copy-pasting required.

   1. Example: `🐱 ${msg.string("image.CAT")}`

10. When referring to a member/user in code, follow the following guideline:

    1. If it's referring to the command user, use `user`.

11. If it's referring to someone influenced by the command, use `member`.

12. When using ParsedArgs as pargs[0].value, import the type it is.

    1. This isn't needed, but it helps IntelliSense and our types.

    2. Example: `pargs[0].value as Member;`

13. When creating a new embed throughs msg.channel.createMessage(), try and attach a footer with info of who ran the command.
    1. If you're using an API, be sure to add the `poweredBy` field.
    2. If you want to have extra content in a footer, use the `extra` field.

```TS
    msg.channel.createMessage({
      embed: {
        title: "bla bla",
        description: "bla bla",
        color: msg.convertHex("general"),
        footer: {
          icon_url: msg.author.dynamicAvatarURL(),
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            // poweredBy: "example",
            // extra: "example",
          }),
        },
      },
    });
```

14. When creating any new TypeScript file, do not forget to include a JSDoc including `@file`, `@description` and optionnaly `@author`.
```TS
    /**
     * @file My file
     * @description File description
     * @author My name <mail@example.com>
     */
```

15. Try using our import scheme :

    1. Types from external modules, alphabetically sorted
    2. Types from internal modules, relatively sorted to the file tree (further in the tree = lower in the imports) THEN alphabetically
    3. Named exports from external modules, alphabetically sorted
    4. Named exports from internal modules, relatively sorted to the file tree (further in the tree = lower in the imports) THEN alphabetically
    5. Default exports from external modules, alphabetically sorted
    6. Default exports from internal modules, relatively sorted to the file tree (further in the tree = lower in the imports) THEN alphabetically
    7. Other constants in CAPS, alphabetically sorted

```TS
   
    
    import type { Type } from "abc-external-module";
    import type { Type } from "mno-external-module";
    import type { Type } from "xyz-external-module";

    import type { Type } from "./xyz-internal-module";
    import type { Type } from "../mno-internal-module-2";
    import type { Type } from "../../abc-internal-module-3";

    import { Export } from "external-module";
    import { Export } from "external-module-2";

    import { Export } from "./xyz-internal-module";
    import { Export } from "../mno-internal-module-2";
    import { Export } from "../../abc-internal-module-3";

    import fs from "fs";
    import path from "path";

    import xyz from "./xyz";
    import abc from "../abc";

    const ABC = "def";
    const UVW = "xyz";
```
