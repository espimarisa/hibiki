# Contributing

Hi! Here's a short list of guidelines you should try and stick to when contributing to Hibiki.

## TL;DR

- Document your code well. Please.
- Don't be dumb. Google is your friend.
- Respect our linter and compiler options.
- Follow semantic commits to the best of your ability.
- Don't rely on external dependencies for simple things.
- Use consistent and understandable variable/function names.

## Localization Quickstart

1. Navigate to Hibiki's [Crowdin homepage][hibiki-translate] and sign in/up.
2. On the homepage, select the language that you'd like to work on.
   - If you don't see your language listed, submit a GitHub issue.
3. In the file listing, select a file to work on.

   - `commands.json` includes strings used in commands.
   - `common.json` includes commonly-used strings.
   - `errors.json` includes error messages.

4. Start navigating through any strings that are red or incomplete. The content on the top is the source, and the content on the bottom is what you should write.
   - Ensure that you copy any emoji that exist in the string.
   - Do not translate anything that is highlighted by Crowdin.
   - Do not translate URLs inside of markdown (`[notThis](butThisIsOK)`).
   - If a word does not exist in your language or wouldn't translate well, keep it as-is.

[hibiki-translate]: https://translate.hibiki.app "Hibiki on Crowdin"
