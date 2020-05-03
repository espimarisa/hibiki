const Command = require("../../lib/structures/Command");

class removewarnCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<id:string>",
      aliases: ["removepunish", "rmpunish", "removestrike", "removestrikes", "rmstrike", "rw", "rmwarn", "removewarning", "removewarnings"],
      description: "Removes one or more warnings.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Maps the IDs
    const warnings = await Promise.all(args.map(async id => {
      if (!id) {
        return { removed: false, warning: id };
      }

      // Gets the warnings
      const warning = await this.bot.db.table("warnings").get(id);
      if (!warning || warning.guild !== msg.channel.guild.id) {
        return { removed: false, warning: id };
      }

      // Deletes the IDs
      await this.bot.db.table("warnings").get(id).delete();
      return { removed: true, warning: id };
    }));

    // Sets amount of IDs removed / failed
    const removed = warnings.filter(w => w.removed);
    const failed = warnings.filter(w => !w.removed);

    // If none could be removed
    if (!removed.length) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No warnings given could be removed.", "error"));
    }

    // Sends the embed
    this.bot.emit("warningRemove", msg.channel.guild, msg.member, removed.map(w => `\`${w.warning}\``));
    await msg.channel.createMessage({
      embed: {
        title: `⚠ Removed ${removed.length} warning${removed.length === 1 ? "" : "s"}.`,
        description: `${removed.map(w => w.warning).join(", ")}`,
        color: this.bot.embed.colour("general"),
        fields: failed.length ? [{
          name: "Failed to remove some warnings.",
          value: `${failed.map(w => w.warning).join(", ")}`,
        }] : [],
      },
    });
  }
}

module.exports = removewarnCommand;
