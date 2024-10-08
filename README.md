# Hibiki

> This branch is in active development and is not ready for self-hosting or production use.

[![Stable Version][badge-stable-version]][version]
[![Build][badge-workflow]][workflow]
[![License][badge-license]][license]

## About

Hibiki is a Discord app providing informational tools and utilities.

## Invite

You can invite the official Hibiki app using [this Discord invite][invite].

**_NO support is given for self-hosted instances._**

## Terms of Service

The information below applies to the official instance of Hibiki. Self-hosted instances or forks may not respect our official Terms of Service or privacy guidelines.

> "Application"/"official instance" refers to the Hibiki Discord application with the user ID of `493904957523623936`.

**Updated on August 13th, 2024**

- Do not try to intentionally crash, break, or exploit the application
- If you find a critical bug or security vulnerability, please report it
- Usage must follow Discord's **[Terms of Service][discord_tos]** and **[Community Guidelines][discord_cg]**
- Usage must obey all laws in the **United States** (host location)

## Data Privacy

**Updated on August 13th, 2024**

_No identifiable information is stored in Hibiki's database._

When added or removed from a server, the following information will be logged to a private Discord channel that only project maintainers can access:

- The server's creation date
- The server name, icon, and guild ID
- The server owner's username and user ID
- The total number of unique members in the server

When an interaction is ran, the following information will be logged to the console output and stored into log files that are kept for 30 days:

- The username and user ID of the interaction runner
- The guild name and guild ID that the interaction was ran in

## License

[zlib/libpng][license]

[badge-stable-version]: https://img.shields.io/github/package-json/v/espimarisa/hibiki/main?color=blue "Shields.io badge showing the latest production version."
[badge-license]: https://img.shields.io/badge/license-zlib-orange.svg "Shields.io badge displaying the zlib license."
[badge-workflow]: https://img.shields.io/github/actions/workflow/status/espimarisa/hibiki/push.yml?branch=develop "Shields.io badge showing the latest workflow status."
[discord_tos]: https://discord.com/terms "A link to Discord's Terms of Service."
[discord_cg]: https://discord.com/guidelines "A link to Discord's Community Guidelines."
[espi-discord]: https://discord.com/users/647269760782041133 "A link to the project maintainer's Discord profile."
[espi-email]: mailto:contact@espi.me "A link to email the primary project maintainer."
[espi-telegram]: https://t.me/espimarisa "A link to message the primary project maintainer on Telegram."
[invite]: https://discord.com/oauth2/authorize?&client_id=493904957523623936&scope=bot%20applications.commands&permissions=28307378007798 "An invite for the official instance of Hibiki."
[license]: LICENSE.md "A link to the LICENSE.md file containing the zlib/libpng license."
[workflow]: https://github.com/espimarisa/hibiki/actions?query=workflow%3Apush "GitHub workflow showing the latest push status."
[version]: https://github.com/espimarisa/hibiki/releases "GitHub releases list for Hibiki."
