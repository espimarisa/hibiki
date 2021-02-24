# Contributing

Here's a pretty cohesive list of guidelines you should try and stick to (and instructions on how to do so).

**TL;DR**

- Respect our linter/compiler. You can use @ts-expect-error or // eslint-disable if you really need to.
- Add a string following our naming convention in `src/locales/en` if you need to.
- Don't rely on external dependencies for simple things that we can create ourselves.
- If you're translating and the word doesn't exist in your language, you should probably leave it as-is.
- Keep your commit/issue/PR messages clean. Follow semantic commits to the best of your ability.

# Translation Guide

1. Navigate to https://translate.hibiki.app.
2. On the homepage, select the language you'd like to work on.
   1. If you don't see your language listed, message a developer or make an issue and it'll be added quickly.
3. In the file listing, open the Hibiki folder and go thru src/locales until you see `en.json`.
4. Select en.json and sign up/sign in to Crowdin. If you don't have an account, GitHub integration is fast.
5. Start navigating through any strings that are red or incomplete. The content on the top is the source, and the content on the bottom is what you should write.
   1. Do not translate anything that is highlighted by Crowdin. These are our variables.
   2. Do not translate markdown URLs (items enclosed in () between []). You can translate markdown text, though.
   3. When translating, copy and paste any emojis that are included in the string. We try and keep these at a minimum, but please preserve them.
   4. Our plural system handles things in a very simple way. The first content is the variable. Don't touch this.
      1. The second content is the word that will show when there's anything but one of something. Additionally, we may use this to display different strings. You can translate these normally. Ex: channel types.
      2. The third content is the word that will show when there's only one of something.
      3. Example: `{variable:#pluralForm#!singularForm!}`
   5. Additionally, if your language has 3 or more plural forms (such as Czech), you can add the others after the second one. Be sure to add an additional ? after the !.
      1. Example: `{variable:#pluralForm#!singularForm!?optional_for_languages_with_multiple_pluralities?}`

# Translation FAQs

Q. What do I do if something can't be translated well?
A. This depends on context. Literal translations can sometimes work, but other times you should just leave it as-is. Type the same content.

Q. What do I do if I don't know how to translate a word?
A. You don't have to translate everything at once. Changes are automatically saved, and any help counts.

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
