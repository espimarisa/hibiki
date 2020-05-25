const Command = require("../../lib/structures/Command");
const Eris = require("eris");

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
    // Category emojis
    function categoryEmoji(category) {
      let label;
      switch (category) {
        case "Core":
          label = "🤖 **Core**";
          break;
        case "Fun":
          label = "🎉 **Fun**";
          break;
        case "Misc":
          label = "✨ **Misc**";
          break;
        case "Moderation":
          label = "🔨 **Moderation**";
          break;
        case "Music":
          label = "🎵 **Music**";
          break;
        case "NSFW":
          label = "🔞 **NSFW**";
          break;
        case "Owner":
          label = "⛔ **Owner**";
          break;
        case "Roleplay":
          label = "️️️❤️ **Roleplay**";
          break;
        default:
          label = "❓ **Uncategorized**";
          break;
      }
      return label;
    }

    // Formats cmd usage
    function cmdusage(argString, delimiter) {
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

    let cmd;
    // Finds the command
    if (args) cmd = this.bot.commands.find(c => c.id.toLowerCase() === args.join(" ").toLowerCase() || c.aliases.includes(args.join(" ").toLowerCase()));
    if (!cmd) {
      let db;
      if (msg.channel.type !== 1) db = await this.bot.db.table("guildcfg").get(msg.channel.guild.id);
      let categories = [];
      // Hides owner & disabled cmds
      this.bot.commands.forEach(c => { if (!categories.includes(c.category) && c.category !== "Owner") categories.push(c.category); });
      if (db && db.disabledCategories) categories = categories.filter(c => !db.disabledCategories.includes(c));
      const sortedcategories = [];
      // Sorts categories
      categories = categories.sort((a, b) => {
        if (a < b) return -1;
        if (a > b) return 1;
        return 0;
      });

      // Current channel help
      categories.forEach(e => { sortedcategories[categories.indexOf(e)] = categoryEmoji(e); });
      if (args && args.join(" ").toLowerCase() === "here") {
        return msg.channel.createMessage({
          embed: {
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
          },
        });
      }

      // DMs command list
      const DMChannel = await msg.author.getDMChannel();
      const dmson = await DMChannel.createMessage({
        embed: {
          color: this.bot.embed.color("general"),
          fields: categories.map(category => ({
            name: sortedcategories[categories.indexOf(category)],
            value: this.bot.commands.map(c => {
              if (db && db.disabledCmds && db.disabledCmds.includes(c.id)) return;
              if (c.category !== category) return;
              return `\`${c.id}\``;
            }).join(" "),
          })),
        },
      }).catch(() => {
        // Sends in channel if failed
        return msg.channel.createMessage({
          embed: {
            color: this.bot.embed.color("general"),
            fields: categories.map(category => ({
              name: sortedcategories[categories.indexOf(category)],
              value: this.bot.commands.map(c => {
                if (c.category !== category) return;
                return `\`${c.id}\``;
              }).join(" "),
            })),
          },
        });
      });
      if (msg.channel instanceof Eris.PrivateChannel) return;
      if (dmson) return msg.addReaction("📬");
    } else {
      const construct = [];
      if (cmd.category === "Owner") return;
      if (cmd.aliases.length) construct.push({ name: "Aliases", value: `${cmd.aliases.map(alias => `\`${alias}\``).join(" ") || "No aliases"}`, inline: false });
      if (cmd.args) construct.push({ name: "Usage", value: cmdusage(cmd.args, " "), inline: false });
      if (cmd.cooldown) construct.push({ name: "Cooldown", value: `${cmd.cooldown} seconds`, inline: true });
      if (cmd.clientperms && cmd.clientperms !== "embedLinks") construct.push({ name: "Bot Permissions", value: cmd.clientperms, inline: true });
      if (cmd.requiredperms) construct.push({ name: "User Permissions", value: cmd.requiredperms, inline: true });
      if (cmd.allowdisable === false) construct.push({ name: "Allow Disable", value: cmd.allowdisable, inline: true });
      if (cmd.staff === true) construct.push({ name: "Staff", value: cmd.staff, inline: true });

      msg.channel.createMessage({
        embed: {
          description: cmd.description,
          color: this.bot.embed.color("general"),
          fields: construct,
          author: {
            icon_url: this.bot.user.dynamicAvatarURL(),
            name: cmd.id,
          },
        },
      });
    }
  }
}


module.exports = helpCommand;
