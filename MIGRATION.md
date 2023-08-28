# Hibiki Migration Plan

This roadmap is currently used internally to keep a rough sketch of the differences between Hibiki v3 and v6. A proper migration guide for self-hosting and end-users will be written up at a later date.

## Database Reset

Due to the age of Hibiki's database and the fact that it still relies on RethinkDB (RIP), we've made the decision to start with a fresh database based on PostgreSQL.

- All user and guild data has been removed.

## Removed Modules

- EasyTranslate has been removed due to being difficult to maintain.
- The message sniping system has been removed due to ToS changes and privacy concerns.
- Used invite logging + caching has been removed due to ToS changes and privacy concerns.

## Removed Commands

### Replaced by native Discord functionality

A lot of features have been implemented natively by Discord since Hibiki v3, making the following commands redundant:

- `bio` and `profile`
  - Discord has added a native "about me" and pronouns field.
- `mute` and `unmute`
  - Discord has a native "time out" feature.
- `filter`
  - Discord has a native automod feature.
- `ban`, `forceban`, `kick`, `nickname`, `softban`, `unban`
  - Discord has native banning, kicking, and nicknaming. These have always been redundant.
- `agree`, `verify`, `unverify`
  - Discord has a native member screening feature.
- `invite`
  - Discord has added an invite button on bot profiles.

### Removed due to switching to slash commands

By moving to slash commands, the following are either redundant or unfeasable currently.

- `addcommand`, `removecommand`
  - A large, global tag system is not worth implementing with slash commands.
- `enable` and `disable`
  - Discord is rolling out integration command permissions.
- `help`, `prefix`
  - Replaced by moving to slash commands as this information is shown in the UI.

### Removed due to Terms of Service changes

Unfortunately, Discord's bot ToS has changed quite a bit meaning some more fun stuff isn't worth keeping around.

- `snipe`
  - Reliant on message content intent, ToS changes, and privacy concerns.
- `Music commands`
  - YouTube support would get us unverified. Not worth the legal hassle.
- `NSFW commands`
  - Including NSFW content in an integration has moderation and ToS concerns.

### Removed to cut down on bloat

A large amount of Hibiki's older commands were there just to fill the gap or by specific request. A goal of v6 is to cut down on bloat.

- `daily`, `pay`, `slots`, `topcookies`
  - The economy system has been removed as we never did anything with it.
- `changelog`, `clean`, `coollevel`, `cowsay`, `fact`, and `owoify`
  - No real purpose is served by their existence and we need slash command space.
- `duck`, `engineeredcatgirls`, `goose`, `lizard`, `megumin`, `meme`, `miku`, `rem`
  - Rarely used image commands that served no real purpose.
- `bite`, `banghead`, `blush`, `cry`, `highfive`, `holdhands`, `lewd`, `lick`, `poke`, `pout`, `punch`, `slap`, `sleepy`, `smile`, `smug`, and `tickle`
  - Rarely used roleplay commands that were not worth merging with the rest.
- `steammonitor`
  - The Steam API is incredibly unreliable; not worth the hassle. Just don't cheat?
- `embed`, `emoji`, `remind`, `simpleembed`, `translate`
  - These legacy utilities are a pain to maintain, rarely used, or reliant on the message content intent.
- `vote`
  - We don't use bot listing websites anymore (besides maybe dbots? Fuck the rest)
- `Owner-only commands`
  - No reason to keep these around anymore.

## Commands independent in both v3 and v6

These commands were both independent in v3 and will continue to be so in v6 with some tweaks.

- `coin`, `dice`, `gaylevel`, `spacephoto`, and `urban`
- `about`, `avatar`, `channelinfo`, `donate`, `gdpr`, `icon`, `ping`, `roleinfo`, `server`, and `userinfo`
- `define`, `github`, `ipinfo`, `inspect`, `poll`, `purge`, `steam`, `twitter`, `weather`, and `wikipedia`

## Commands merged into subcommands in v6

These commands have been merged or reworked into one or more subcommands. Further documentation will come later. Our goal with subcommands is for them to be "all-in-one" focused with specific uses built as a subcommand. This results in better UX and saves us a slash command spot.

- `divorce + marry -> marriage (propose, divorce)`
- `shard + shards -> shard (current, list)`
- `banner + splashbanner -> serverbanner (server, splash)`
- `cat + dog + fox + httpcat + httpdog -> animal (type)`
- `catgirl + foxgirl -> neko (catgirl, foxgirl)`
- `garfield + xkcd -> comic (garfield, xkcd, more)`
- `addpoint + removepoint + points -> reputation (add, remove, list)`
- `cuddle + hug + kiss + pat -> roleplay (cuddle, hug, kiss, pat)`
- `aur + npm -> package (npm, aur, more planned)`
- `fortnite + osu -> gamestats (fortnite, osu, more planned)`
- `currency + crypto -> currency (string input, can parse 3 letter or full)`
- `timefor -> time (location, no longer per-user)`
