import type { EmbedField, Message, TextChannel } from "eris";
import { GuildChannel, PrivateChannel } from "eris";
import { Command } from "../../classes/Command";

export class HelpCommand extends Command {
  description = "Sends a list of commands or info about a specific command.";
  args = "[command:string] | [here:string]";
  aliases = ["commands", "h", "listcmds", "listcommands"];
  allowdisable = false;
  allowdms = true;
  silent = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Localizes command categories
    function formatCategory(category: string) {
      let label = "";

      switch (category) {
        case "fun":
          label = `🎉 ${msg.string("general.HELP_CATEGORY_FUN")}`;
          break;
        case "general":
          label = `🤖 ${msg.string("general.HELP_CATEGORY_GENERAL")}`;
          break;
        case "image":
          label = `🖼 ${msg.string("general.HELP_CATEGORY_IMAGE")}`;
          break;
        case "moderation":
          label = `🔨 ${msg.string("general.HELP_CATEGORY_MODERATION")}`;
          break;
        case "music":
          label = `🎵 ${msg.string("general.HELP_CATEGORY_MUSIC")}`;
          break;
        case "nsfw":
          label = `🔞 ${msg.string("general.HELP_CATEGORY_NSFW")}`;
          break;
        case "roleplay":
          label = `❤ ${msg.string("general.HELP_CATEGORY_ROLEPLAY")}`;
          break;
        case "utility":
          label = `🔧 ${msg.string("general.HELP_CATEGORY_UTILITY")}`;
          break;
        default:
          label = `❓ ${msg.string("general.HELP_CATEGORY_UNKNOWN")}`;
          break;
      }

      return label;
    }

    // Finds a command
    let cmd: Command;
    let owneramt = 0;
    this.bot.commands.forEach((c) => (c.category === "owner" ? owneramt++ : null));

    if (args)
      cmd = this.bot.commands.find(
        (c) => c.name.toLowerCase() === args.join(" ").toLowerCase() || c.aliases.includes(args.join(" ").toLowerCase()),
      );

    // If no command, send a list of commands
    if (!cmd) {
      let db: GuildConfig;
      if (msg.channel instanceof GuildChannel) db = await this.bot.db.getGuildConfig(msg.channel.guild.id);
      let categories: string[] = [];

      // Hides owner & disabled cmds
      this.bot.commands.forEach((c) => {
        if (!categories.includes(c.category) && c.nsfw === true && msg.channel.guild && msg.channel.nsfw !== true) return;
        if (!categories.includes(c.category) && c.category !== "owner") categories.push(c.category);
      });

      if (db?.disabledCategories)
        categories = categories.filter((c) => {
          return !db.disabledCategories.includes(c);
        });

      const sortedcategories: string[] = [];

      // Sorts categories
      categories = categories.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // Formats categories
      categories.forEach((e) => {
        sortedcategories[categories.indexOf(e)] = formatCategory(e);
      });

      // Sends help in the current channel
      if (args?.join(" ").toLowerCase() === "here") {
        msg.channel.sendTyping();
        return msg.channel.createMessage({
          embed: {
            title: `📚 ${msg.string("general.HELP")}`,
            description: msg.string("general.HELP_DESCRIPTION", { prefix: db?.prefix ? db.prefix : this.bot.config.prefixes[0] }),
            color: msg.convertHex("general"),
            fields: categories.map((category) => ({
              name: sortedcategories[categories.indexOf(category)],
              // Hides disabled commands
              value: this.bot.commands
                .map((c) => {
                  if (db?.disabledCmds?.includes?.(c.name) && c.allowdisable !== false) return;
                  if (c.nsfw === true && msg.channel.guild && msg.channel.nsfw !== true) return;
                  if (c.category !== category) return;
                  return `\`${c.name}\``;
                })
                .join(" "),
            })),
            footer: {
              icon_url: msg.author.dynamicAvatarURL(),
              text: msg.string("global.RAN_BY", {
                author: msg.tagUser(msg.author),
                extra: msg.string("general.HELP_COMMANDS", { commands: this.bot.commands.length - owneramt }),
              }),
            },
          },
        });
      }

      // DMs the user a list of commands
      const dmChannel = await msg.author.getDMChannel();
      const dmson = await dmChannel
        .createMessage({
          embed: {
            title: `📚 ${msg.string("general.HELP")}`,
            description: msg.string("general.HELP_DESCRIPTION", { prefix: db?.prefix ? db.prefix : this.bot.config.prefixes[0] }),
            color: msg.convertHex("general"),
            fields: categories.map((category) => ({
              name: sortedcategories[categories.indexOf(category)],
              value: this.bot.commands
                .map((c) => {
                  if (db?.disabledCmds?.includes?.(c.name)) return;
                  if (c.category !== category) return;
                  return `\`${c.name}\``;
                })
                .join(" "),
            })),
            footer: {
              icon_url: msg.author.dynamicAvatarURL(),
              text: msg.string("global.RAN_BY", {
                author: msg.tagUser(msg.author),
                extra: msg.string("general.HELP_COMMANDS", { commands: this.bot.commands.length - owneramt }),
              }),
            },
          },
        })
        .catch(() => {
          // Sends in the channel if failed
          msg.channel.createMessage({
            embed: {
              title: `📚 ${msg.string("general.HELP")}`,
              description: msg.string("general.HELP_DESCRIPTION", { prefix: db?.prefix ? db.prefix : this.bot.config.prefixes[0] }),
              color: msg.convertHex("general"),
              fields: categories.map((category) => ({
                name: sortedcategories[categories.indexOf(category)],
                value: this.bot.commands
                  .map((c) => {
                    if (db?.disabledCmds?.includes?.(c.name)) return;
                    if (c.nsfw === true && msg.channel.nsfw !== true) return;
                    if (c.category !== category) return;
                    return `\`${c.name}\``;
                  })
                  .join(" "),
              })),
              footer: {
                icon_url: msg.author.dynamicAvatarURL(),
                text: msg.string("global.RAN_BY", {
                  author: msg.tagUser(msg.author),
                  extra: msg.string("general.HELP_COMMANDS", { commands: this.bot.commands.length - owneramt }),
                }),
              },
            },
          });

          return;
        });

      // Adds a reaction; ignores in DMs
      if (msg.channel instanceof PrivateChannel) return;
      if (dmson) return msg.addReaction("📬").catch(() => {});
    } else {
      const fields: EmbedField[] = [];
      let aliases: string[] = [];
      aliases = [...cmd.aliases].sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // Command aliases
      if (cmd.aliases.length) {
        fields.push({
          name: msg.string("general.HELP_ALIASES"),
          value: aliases.map((alias) => `\`${alias}\``).join(", "),
          inline: false,
        });
      }

      // Command usage
      if (cmd.args) {
        fields.push({
          name: msg.string("general.HELP_USAGE"),
          value: cmd.args
            .split(" ")
            .map((arg) => `${arg.split(":")[0]}${arg[0] === "<" ? ">" : arg[0] === "[" ? "]" : ""}`)
            .join(" "),
          inline: false,
        });
      }

      // Command cooldown
      if (cmd.cooldown) {
        fields.push({
          name: msg.string("general.HELP_COOLDOWN"),
          value: msg.string("global.SECONDS", { seconds: cmd.cooldown / 1000 }),
          inline: true,
        });
      }

      // Command clientperms
      if (cmd.clientperms?.length && cmd.clientperms !== ["embedLinks"]) {
        fields.push({
          name: msg.string("general.HELP_BOTPERMS"),
          value: cmd.clientperms.join(", "),
          inline: false,
        });
      }

      // Command requiredperms
      if (cmd?.requiredperms.length) {
        fields.push({
          name: msg.string("general.HELP_REQUIREDPERMS"),
          value: cmd.requiredperms.join(", "),
          inline: false,
        });
      }

      // If a command isn't toggleable
      if (!cmd.allowdisable) {
        fields.push({
          name: msg.string("general.HELP_ALLOWDISABLE"),
          value: `${cmd.allowdisable}`,
          inline: true,
        });
      }

      // If a command is staff restricted
      if (cmd.staff) {
        fields.push({
          name: msg.string("general.HELP_STAFF"),
          value: `${cmd.staff}`,
          inline: true,
        });
      }

      // Sends info about a specific command
      msg.channel.sendTyping();
      msg.channel.createMessage({
        embed: {
          description: cmd.description,
          color: msg.convertHex("general"),
          fields: fields,
          author: {
            name: cmd.name,
            icon_url: this.bot.user.dynamicAvatarURL(),
          },
          footer: {
            icon_url: msg.author.dynamicAvatarURL(),
            text: msg.string("global.RAN_BY", {
              author: msg.tagUser(msg.author),
              extra: msg.string("general.HELP_COMMANDS", { commands: this.bot.commands.length - owneramt }),
            }),
          },
        },
      });
    }
  }
}
