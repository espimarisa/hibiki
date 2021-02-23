const Command = require("../../structures/Command");

class removepointCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["removemerit", "removemerits", "removepoint", "removepoints", "rmmerit", "rmmerits", "rmpoint", "rmpoints"],
      args: "<id:string>",
      description: "Removes one or more reputation points from a member.",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args) {
    // Maps the points
    const points = await Promise.all(args.map(async id => {
      if (!id) {
        return { removed: false, point: id };
      }

      // Gets the points in the database
      const point = await this.bot.db.table("points").get(id).run();
      if (!point || point.guild !== msg.channel.guild.id) {
        return { removed: false, point: id };
      }

      // Deletes the points
      await this.bot.db.table("points").get(id).delete().run();
      return { removed: true, point: id };
    }));

    // Sets amount of IDs removed / failed
    const removed = points.filter(p => p.removed);
    const failed = points.filter(p => !p.removed);

    if (!removed.length) {
      return this.bot.embed("❌ Error", "No reputation points given could be removed.", msg, "error");
    }

    this.bot.emit("pointRemove", msg.channel.guild, msg.member, removed.map(p => `\`${p.point}\``));

    msg.channel.createMessage({
      embed: {
        title: `✨ Removed ${removed.length} point${removed.length === 1 ? "" : "s"}.`,
        description: `${removed.map(p => p.point).join(", ")}`,
        color: this.bot.embed.color("general"),
        fields: failed.length ? [{
          name: "Failed to remove some points.",
          value: `${failed.map(p => p.point).join(", ")}`,
        }] : [],
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = removepointCommand;
