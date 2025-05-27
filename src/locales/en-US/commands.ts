/**
 * @file Command localization data.
 * @license CC-BY-SA-4.0
 */

export const commands = {
  about: {
    _data: {
      description: "Shows information and statistics about me.",
      name: "about",
    },
    response: {
      description:
        "I'm a Discord bot with polished community and developer tools. \n\nMade with love by [Espi Marisa](https://espi.me). 💖",
      links:
        "[GitHub](https://github.com/espimarisa/hibiki) • [Invite](https://discord.com/api/oauth2/authorize?client_id={{id}}&permissions={{permissions}}&scope=bot%20applications.commands) • [Privacy Policy](https://github.com/espimarisa/hibiki/blob/develop/.github/PRIVACY_POLICY.md) • [Donate](https://ko-fi.com/espimarisa)",
      statistics: "Statistics",
      system: "System",
      systemDetails: "Using {{memory}} of memory\n{{uptime}} of uptime",
      title: "✨ {{ username }}",
      version: "Version",
      versionDetails:
        "Hibiki {{- hibiki}}\nDiscord.js {{- djs}} \nBun {{- bun}}",
    },
  },
  animal: {
    _data: {
      description: "Gets a picture of various animals.",
      name: "animal",
    },
    subcommands: {
      cat: {
        _data: {
          description: "Sends a random cat picture.",
          name: "cat",
        },
        response: {
          meow: "😺 Meow!",
        },
      },
      dog: {
        _data: {
          description: "Sends a random dog picture.",
          name: "dog",
        },
        response: {
          woof: "🐶 Woof!",
        },
      },
    },
  },
  coin: {
    _data: {
      description: "Flips a coin",
      name: "coin",
    },
    response: {
      heads: "🔵 The coin landed on heads.",
      tails: "🟠 The coin landed on tails.",
    },
  },
  dice: {
    _data: {
      description: "Rolls a die.",
      name: "dice",
      options: {
        sides: {
          description: "The amount of sides on the die. Defaults to 6.",
          name: "sides",
        },
      },
    },
    response: {
      result: "🎲 Your {{sides}}-sided die rolled a **{{roll}}**.",
    },
  },
  github: {
    _data: {
      description: "Gets information about a GitHub user or repository.",
      name: "github",
    },
    subcommands: {
      repository: {
        _data: {
          description: "Gets information about a GitHub repository.",
          name: "repository",
          options: {
            url: {
              description: "The repository to lookup (URL or username/repo).",
              name: "url",
            },
          },
        },
      },
      user: {
        _data: {
          description: "Gets information about a GitHub user or organization.",
          name: "username",
          options: {
            username: {
              description: "The username of the user to lookup.",
              name: "username",
            },
          },
        },
      },
    },
  },
  ping: {
    _data: {
      description: "Checks the current status and shard latency.",
      name: "ping",
    },
    response: {
      pong: "🏓 Pong! All seems OK!",
      result:
        "This reply took {{ping}}ms to send on shard #{{shard}}. Latency: {{latency}}ms.",
    },
  },
  roleplay: {
    _data: {
      description: "Roleplay with other server members.",
      name: "roleplay",
    },
    errors: {
      bot: "I'd rather not do that with you. Keep your paws away from me.",
      self: "How about you interact with someone else in the world for once?",
    },
    subcommands: {
      cuddle: {
        _data: {
          description: "Give someone some cuddles!",
          name: "cuddle",
          options: {
            member: {
              description: "The member that you'd like to cuddle.",
              name: "member",
            },
          },
        },
        response: {
          message: "💖 {{user}} gave {{target}} some cuddles.",
        },
      },
      hug: {
        _data: {
          description: "Give someone a warm hug!",
          name: "hug",
          options: {
            member: {
              description: "The member that you'd like to hug.",
              name: "member",
            },
          },
        },
        response: {
          message: "❤️ {{user}} gave {{target}} a warm hug.",
        },
      },
      kiss: {
        _data: {
          description: "Give someone a kiss!",
          name: "kiss",
          options: {
            member: {
              description: "The member that you'd like to kiss.",
              name: "member",
            },
          },
        },
        response: {
          message: "💕 {{user}} gave {{target}} a kiss.",
        },
      },
      pat: {
        _data: {
          description: "Give someone a headpat!",
          name: "pat",
          options: {
            member: {
              description: "The member that you'd like to pat.",
              name: "member",
            },
          },
        },
        response: {
          message: "💙 {{user}} gave {{target}} some headpats.",
        },
      },
      slap: {
        _data: {
          description: "Slap someone!",
          name: "slap",
          options: {
            member: {
              description: "The member that you'd like to slap.",
              name: "member",
            },
          },
        },
        response: {
          message: "💢 {{user}} slapped {{target}}! Play nice, now!",
        },
      },
    },
  },
};
