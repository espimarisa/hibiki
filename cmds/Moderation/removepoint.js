const Command = require("../../lib/structures/Command");

class removepointCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<id:string>",
      aliases: ["removemerit", "removemerits", "removepoint", "removepoints", "rmmerits", "rmpoints"],
      description: "Removes a reputation point from a user.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Maps the IDs
    const points = await Promise.all(args.map(async id => {
      if (!id) {
        return { removed: false, point: id };
      }

      // Gets the points
      const point = await this.bot.db.table("points").get(id);
      if (!point || point.guild !== msg.channel.guild.id) {
        return { removed: false, point: id };
      }

      // Deletes the IDs
      await this.bot.db.table("points").get(id).delete();
      return { removed: true, point: id };
    }));

    // Sets amount of IDs removed / failed
    const removed = points.filter(p => p.removed);
    const failed = points.filter(p => !p.removed);

    // If none could be removed
    if (!removed.length) {
      return msg.channel.createMessage(this.bot.embed("❌ Error", "No reputation points given could be removed.", "error"));
    }

    // Sends the embed
    this.bot.emit("pointRemove", msg.channel.guild, msg.member, removed.map(p => `\`${p.point}\``));
    await msg.channel.createMessage({
      embed: {
        title: `✨ Removed ${removed.length} point${removed.length === 1 ? "" : "s"}.`,
        description: `${removed.map(p => p.point).join(", ")}`,
        color: this.bot.embed.colour("general"),
        fields: failed.length ? [{
          name: "Failed to remove some points.",
          value: `${failed.map(p => p.point).join(", ")}`,
        }] : [],
      },
    });
  }
}

module.exports = removepointCommand;
