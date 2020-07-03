const Command = require("../../structures/Command");
const Eris = require("eris");
const waitFor = require("../../utils/waitFor");

const backEmoji = "⬅️";
const categoryEmojis = {
  Fun: "🎉",
  General: "🤖",
  Misc: "✨",
  Moderation: "🔨",
  NSFW: "🔞",
  Roleplay: "❤️",
  All: "📚",
};

class helpCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["commands", "listcmds", "listcommands"],
      args: "[command:string]",
      description: "Sends a list of commands or info about a specific command.",
      allowdisable: false,
      allowdms: true,
    });
  }

  async run(msg, args) {
    // Formats categories
    function categoryEmoji(category) {
      let label;
      switch (category) {
        case "Fun":
          label = `${categoryEmojis.Fun} Fun commands`;
          break;
        case "General":
          label = `${categoryEmojis.General} General commands`;
          break;
        case "Misc":
          label = `${categoryEmojis.Misc} Misc commands`;
          break;
        case "Moderation":
          label = `${categoryEmojis.Moderation} Moderation commands`;
          break;
        case "NSFW":
          label = `${categoryEmojis.NSFW} NSFW commands`;
          break;
        case "Owner":
          label = `${categoryEmojis.Owner} Owner commands`;
          break;
        case "Roleplay":
          label = `${categoryEmojis.Roleplay} Roleplay commands`;
          break;
        case "All":
          label = `${categoryEmojis.All} All commands`;
          break;
        default:
          label = "Uncategorized commands";
          break;
      }

      return label;
    }

    // Formats cmd usage
    function commandUsage(argString, delimiter) {
      const argObj = [];
      argString.split(delimiter).forEach(arg => {
        const r = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*]{1,})?(>|\])/.exec(arg);
        if (!r) return;
        argObj.push({
          name: r[2],
          type: r[3],
          flag: r[4],
          optional: r[1] === "[",
        });
      });

      return argObj.map(val => `${val.optional ? "[" : "<"}${val.name}${val.optional ? "]" : ">"}`).join(delimiter);
    }

    // Finds the command
    let cmd;
    if (args) cmd = this.bot.commands.find(c => c.id.toLowerCase() === args.join(" ").toLowerCase() ||
      c.aliases.includes(args.join(" ").toLowerCase()));

    if (!cmd) {
      let db;
      if (msg.channel.type !== 1) db = await this.bot.db.table("guildcfg").get(msg.channel.guild.id).run();
      let categories = [];

      // Hides owner & disabled cmds
      this.bot.commands.forEach(c => {
        if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category);
      });

      if (db && db.disabledCategories) categories = categories.filter(c => !db.disabledCategories.includes(c));

      // Sorts categories
      const sortedcategories = [];
      categories = categories.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      categories.forEach(e => {
        sortedcategories[categories.indexOf(e)] = categoryEmoji(e);
        sortedcategories.push("📚 All commands");
      });

      const categoryembed = {
        embed: {
          title: "📚 React with the category you'd like to view.",
          color: this.bot.embed.color("general"),
          description: `${sortedcategories.join("\n")}`,
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      };

      const omsg = await msg.channel.createMessage(categoryembed);
      Object.values(categoryEmojis).forEach(e => omsg.addReaction(e));
      let curCategory;

      // Waits for reaction
      await waitFor("messageReactionAdd", 60000, async (m, emoji, uid) => {
        if (uid !== msg.author.id) return;
        if (m.id !== omsg.id) return;
        if (emoji.name === backEmoji && curCategory) {
          omsg.edit(categoryembed);
          curCategory = undefined;
          if (msg.channel instanceof Eris.PrivateChannel) return;
          omsg.removeReaction(backEmoji);
          omsg.removeReaction(backEmoji, uid);
          return;
        }

        // Gets commands in each category
        const category = Object.entries(categoryEmojis).find(e => e[1] === emoji.name);

        if (!category) return;
        let categorycmds = this.bot.commands.filter(c => c.category === category[0]);
        if (db && db.disabledCommands) categorycmds = categorycmds.filter(c => !db.disabledCommands.includes(c));

        // Maps the commands; ignores disabled
        const finalCommands = categorycmds.map(c => {
          if (db && db.disabledCmds && db.disabledCmds.includes(c.id)) return;
          return `\`${c.id}\``;
        });


        // Shows all commands
        if (category[0] === "All") {
          omsg.edit({
            embed: {
              title: `${categoryEmojis[category[0]]} Run ${db && db.prefix ? db.prefix : this.bot.config.prefixes[0]}` +
                `help <command> for info about a command.`,
              color: this.bot.embed.color("general"),
              fields: categories.map(category => ({
                name: sortedcategories[categories.indexOf(category)],
                // Hides disabled commands
                value: this.bot.commands.map(c => {
                  if (db && db.disabledCmds && db.disabledCmds.includes(c.id)) return;
                  if (c.category !== category) return;
                  return `\`${c.id}\``;
                }).join(" "),
              })),
              footer: {
                text: `Ran by ${this.bot.tag(msg.author)} | ${this.bot.commands.length} commands`,
                icon_url: msg.author.dynamicAvatarURL(),
              },
            },
          });
        } else {
          omsg.edit({
            embed: {
              title: `${categoryEmojis[category[0]]} Run ${db && db.prefix ? db.prefix : this.bot.config.prefixes[0]}` +
                `help <command> for info about a command.`,
              color: this.bot.embed.color("general"),
              description: `${finalCommands.join(", ")}`,
              footer: {
                text: `Ran by ${this.bot.tag(msg.author)} | ${categorycmds.length} ${category[0].toLowerCase()} commands`,
                icon_url: msg.author.dynamicAvatarURL(),
              },
            },
          });
        }

        // Functionality in DMs
        if (msg.channel instanceof Eris.PrivateChannel) {
          curCategory = category[0];
          omsg.addReaction(backEmoji);
          return;
        }

        // Removes the reactions
        omsg.removeReaction(emoji.name, uid);
        omsg.addReaction(backEmoji);
        curCategory = category[0];
      }, this.bot).catch(err => err.message === "timeout" &&
        // Timeout
        omsg.edit({
          embed: {
            title: "❌ Error",
            description: "The timeout was reached. You can ignore this or run the help command again.",
            color: this.bot.embed.color("general"),
            footer: {
              text: `Ran by ${this.bot.tag(msg.author)}`,
              icon_url: msg.author.dynamicAvatarURL(),
            },
          },
        }).catch(() => {}));
    } else {
      // Help for command
      const construct = [];
      if (cmd.category === "Owner") return;
      if (cmd.aliases.length) {
        construct.push({
          name: "Aliases",
          value: `${cmd.aliases.map(alias => `\`${alias}\``).join(" ")}`,
          inline: false,
        });
      }

      if (cmd.args) {
        construct.push({
          name: "Usage",
          value: commandUsage(cmd.args, " "),
          inline: false,
        });
      }

      if (cmd.cooldown) {
        construct.push({
          name: "Cooldown",
          value: `${cmd.cooldown} seconds`,
          inline: true,
        });
      }

      if (cmd.clientperms && cmd.clientperms !== "embedLinks") {
        construct.push({
          name: "Bot Permissions",
          value: cmd.clientperms,
          inline: true,
        });
      }

      if (cmd.requiredperms) {
        construct.push({
          name: "User Permissions",
          value: cmd.requiredperms,
          inline: true,
        });
      }

      if (cmd.allowdisable === false) {
        construct.push({
          name: "Allowed Disable",
          value: cmd.allowdisable,
          inline: true,
        });
      }

      if (cmd.staff === true) {
        construct.push({
          name: "Staff",
          value: cmd.staff,
          inline: true,
        });
      }

      msg.channel.createMessage({
        embed: {
          description: cmd.description || "No description given.",
          color: this.bot.embed.color("general"),
          fields: construct,
          author: {
            name: cmd.id,
            icon_url: this.bot.user.dynamicAvatarURL(),
          },
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }
  }
}

module.exports = helpCommand;
