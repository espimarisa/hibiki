# Contributing

Here's a pretty cohesive list of guidelines you should try and stick to (and instructions on how to do so).

**TL;DR**

- Respect our linter/compiler. You can use @ts-expect-error or // eslint-disable if you really need to.
- Add a string following our naming convention in `src/locales/en` if you need to.
- Don't rely on external dependencies for simple things that we can create ourselves.
- If you're translating and the word doesn't exist in your language, you should probably leave it as-is.
- Keep your commit/issue/PR messages clean. Follow semantic commits to the best of your ability.

## Translating

- Our translation system is powered by Crowdin.
  - If you aren't what you would consider fluent in a language, please don't attempt to translate it. Additionally, don't rely on Google translate.
  - To translate something, go to https://translate.hibiki.app and click the language you want to translate. Then, click on `en.json` and start translating.
    - You need an account to do this. It's easier to sign up thru GitHub.
  - If you want to translate a language that isn't listed, file an issue on GitHub and it will be added ASAP.
  - When translating a string, don't change any values that are in `{}`.
    - To use plurals: { value:# string_for_more_than_one#! string_for_only_one!? }
    - Do not translate anything enclosed in {} or URLs enclosed in (). These will break output if touched.
  - When translating, copy and paste any emojis that are in the string. We aim to keep this at a minimum, but try and keep them there.

## Source Contributions

We probably won't outright reject a PR if it doesn't follow these guidelines, but please try and stick to them. It makes our job a lot easier.

- Follow our existing linter/style guide. While annoying to some, it's pretty strict.
- Respect existing eslint/tsconfig options; don't disable anything in those files.

  - You can use @ts-expect-error or // eslint-disable if absolutely needed, but we like to remove those and fix the problem.

- When importing a value that's only used as a type, use `import type`. TSC will warn you if you do otherwise.

- When exporting a new module, don't do `export default name`. Instead, do `export name`.

  - Example: `export ExampleClass` over `export default ExampleClass`

- Follow our naming schemes for functions, constants, classes, etc to the best of your ability. The linter should warn you about them.

  - Additionally, try and use reasonable variable names. It's much easier to refactor something that's documented well and has meaningful variable names than just `a` or `b`.

- When adding a new string, update it in `src/locales/en.json` **only**. Try and follow our naming scheme.

  - When referencing a string, put any emoji it may use before it. This makes translations easier as there's no extra copy-pasting required.
    - Example: `🐱 ${msg.string("image.CAT)}`

- When referring to a member/user in code, follow the following guideline:

  - If it's referring to the command user, use `user`.
  - If it's referring to someone influenced by the command, use `member`.

- When using ParsedArgs as pargs[0].value, import the type it is.

  - This isn't needed, but it helps intellisense.

  - Example: `pargs[0].value as Member;`

- When creating a new embed thru msg.channel.createMessage(), try and attach a footer with info of who ran the command.

  - This is strictly for liability reasons on production
