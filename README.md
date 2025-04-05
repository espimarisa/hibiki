# [Hibiki Development][hibiki]

> This branch is in active development and is not meant for self-hosting or production usage.

## About

Hibiki is a Discord application that *really needs a better introduction written here*.

## Invite

You can invite Hibiki to your Discord server [using this install link][install].

The following information in this section applies only to [the official Hibiki instance][hibiki].

### Terms of Service

By installing or interacting with the official Hibiki instance (username `Hibiki#1448`, User ID `493904957523623936`), you agree to abide by this Terms of Service and the associated Privacy Policy.

- All usage must comply with [Discord’s Terms of Service][discord-tos] and [Community Guidelines][discord-guidelines].
- Do not intentionally crash, exploit, or otherwise interfere with the application's functionality.
- All usage must comply with applicable federal, state (Alabama), and local laws of the United States.
- We reserve the right to remove the application from any server or user at our discretion, without notice.

### Privacy Policy

*No personally identifiable information (PII) is stored in Hibiki's database or on its host.*

When an interaction is run, certain information is stored in-memory to enable application functionality:

- The username and user ID of the interaction runner
- The name and server ID where the interaction was run
- The interaction runner's preferred locale returned from Discord

When the application is added to or removed from a server, the following information is logged to a private Discord channel accessible only to the application owner:

- The server’s creation date
- The server’s name, icon, and ID
- The server owner's username and ID
- The total number of members in the server

When an interaction is run, the following data is logged to the console and stored in log files, which may be retained for up to 30 days for debugging and service reliability:

- The username and user ID of the interaction runner
- The server name and server ID where the interaction occurred
- Errors thrown by the application which may include any of the above

### Contact

If you need to contact the application owner, you may do so via the following channels:

- **GitHub**: [espimarisa][hibiki] — preferred for reporting bugs and issues
- **Discord**: [espimarisa][espi-discord] — please state your reason after sending a friend request
- **Email**: [contact@espi.me][espi-email] — please include “Hibiki” in the subject line if using email

## License

[zlib](LICENSE)

[hibiki]: https://github.com/espimarisa/hibiki "Hibiki GitHub Repo"
[install]: https://discord.com/oauth2/authorize?client_id=493904957523623936&permissions=563467534068800&scope=bot%20applications.commands "A link to install Hibiki to a Discord server."
[discord-tos]: https://discord.com/terms "A link to Discord's Terms of Service."
[discord-guidelines]: https://discord.com/guidelines "A Link to Discord's community guidelines."
[espi-discord]: https://discord.com/users/647269760782041133 "A link to Espi's Discord profile."
[espi-email]: mailto:contact@espi.me?subject=Hibiki "A link to email Espi."
