# Hibiki Migration Guide

This guide will assist hosters and users from the migration from Hibiki v3.x.x to Hibiki v5.0.0.

## Preface

Hibiki is evolving. Hibiki was created almost 5 years ago with one goal in mind: **be the best**. Unfortunately, it is impossible to be a jack-of-all-trades, master-of-all. This is why we have made the hard decision to move away from being an "all-in-one" Discord bot, and move away from fun, roleplay, and moderation and shift towards a "Swiss-Army Knife" approach to being a utility bot.

This means that a large number of formerly "fun" and "moderation" commands have been discontinued, which you can view below. However, it opens the door for lots of new, useful, fun, and innovative utilities to be added. ✨

## Database Reset

Due to Hibiki's database age and the amount of schema versions it has been through, we have made the hard decision to completely reset RethinkDB and move to PostgreSQL, starting with Hibiki v5.0.0.

- **ALL** user data has been wiped, both from our database and servers.

## Removed Commands and Modules

Unfortunately, due to Hibiki's age as a project, the project goals evolving, and Discord as a whole becoming more mature, we have decided to discontinue a large number of legacy commands and modules in Hibiki v5.0.0. Most of these can be replaced by native Discord functions, however, so don't worry too much.

## Removed Modules

The following modules have been removed as Discord has introduced their own superior native systems:

- Automod
- User profiles
- Agree channel/role
- Muting and unmuting
- Verifying and unverifying
- Enabling and Disabling commands

The following modules have been removed as a result of switching to Slash commands:

- EasyTranslate
- Custom command responses (aka "tags")

The following other modules have been removed due to TOS changes and privacy concerns:

- Message sniping system
- Invite use logging and caching

## Removed Commands

9 commands formely from the **fun** category have been removed:

- `cookies`, `daily`, `pay`, `slots`, and `topcookies` have all been removed as the economy system has been removed
- `coollevel`, `cowsay`, `gaylevel`, `owoify`, have all been removed as they're useless and take up command space

7 commands formerly from the **general** category have been removed:

- `agree`, `bio`, and `profile` have been removed as Discord has implemented a better native system.
- `enable` and `disable` have been removed as Discord is working on a native system.
- `shards` has been removed as we've switched to the Interaction gateway.
- `vote` has been removed as bot listing websites, **especially Top.gg**, are incredibly predatory!

7 commands formerly from the **image** category have been removed:

- `duck`, `engineeredcatgirls`, `goose`, `lizard` have all been removed due to taking up command space.
- `megumin`, `miku`, and `rem` have all been removed due to TOS changes.

13 commands formerly from the **moderation** category have been removed:

- `addcommand` and `removecommand` have been removed due to switching to Slash commands.
- `embed` and `simpleembed` have been removed due to switching to Slash commands.
- `filter` has been removed due to Discord implementing their own native Automod system.
- `mute` and `unmute` have been removed due to Discord implementing a native "Time-out" system.
- `kick` and `ban` have been removed due to Discord's implementation being better.
- `nickname` has been removed due to Discord adding their own Slash command version.
- `snipe` has been removed due to the "Message Sniping" feature being discontinued due to privacy concerns.
- `verify` and `unverify` have been removed due to Discord introducing their own native Verification system.

15 commands formerly from the **roleplay** category have been removed.

- `banghead`, `blush`, `bite`, `cry`, `holdhands`, `highfive`, `lewd`, `lick`, `poke`, `pout`, `punch`, `sleepy`, `smile`, `smug`, and `tickle` have all been removed.

The **entire NSFW category** has been discontinued and Hibiki will not have another NSFW feature.

- This is due to TOS changes and our desire to make a project for **everyone**.
