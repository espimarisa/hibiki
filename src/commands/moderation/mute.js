const Command = require("../../structures/Command");
const hierarchy = require("../../utils/hierarchy");

class muteCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["m", "silence", "shutup"],
      args: "<member:member> [reason:string]",
      description: "Mutes a member.",
      clientperms: "manageRoles",
      requiredperms: "manageMessages",
      staff: true,
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let reason = args.slice(1).join(" ");
    if (!reason.length) reason = "No reason provided.";
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // Reads db; finds role
    const guildconfig = await this.bot.db.table("guildconfig").get(msg.channel.guild.id).run();

    if (!guildconfig || !guildconfig.mutedRole) {
      await this.bot.db.table("guildconfig").insert({
        id: msg.channel.guild.id,
      }).run();

      return this.bot.embed("❌ Error", "The muted role hasn't been configured yet.", msg, "error");
    }

    // If bot doesn't have high enough role
    if (!hierarchy(msg.channel.guild.members.get(this.bot.user.id), user)) {
      return this.bot.embed("❌ Error", `I don't have a high enough role to mute **${user.username}**.`, msg, "error");
    }

    // If member is already muted
    if (user.roles.includes(guildconfig.mutedRole)) {
      return this.bot.embed("❌ Error", `**${user.username}** already has the muted role.`, msg, "error");
    }

    // If author is above member
    if (hierarchy(msg.member, user)) {
      await this.bot.db.table("mutecache").insert({
        role: "",
        member: user.id,
        guild: msg.channel.guild.id,
      }).run();

      // Mutes if no roles
      if (!user.roles.length) {
        try {
          await user.addRole(guildconfig.mutedRole, `Muted by ${this.bot.tag(msg.author)} for ${reason}`);
        } catch (err) {
          return this.bot.embed("❌ Error", `Failed to add the muted role to **${user.username}**.`, msg, "error");
        }

        this.bot.emit("memberMute", msg.channel.guild, msg.member, user, reason);
        return this.bot.embed("✅ Success", `**${user.username}** was muted.`, msg, "success");
      }

      // If member has roles
      await user.roles.forEach(async roles => {
        await this.bot.db.table("mutecache").insert({
          role: roles,
          member: user.id,
          guild: msg.channel.guild.id,
        }).run();

        // Removes other roles
        try {
          await msg.channel.guild.removeMemberRole(user.id, roles);
        } catch (err) {
          return this.bot.embed("❌ Error", `Failed to remove **${user.username}**'s other roles.`, msg, "error");
        }
      });

      // Mutes the member
      try {
        await user.addRole(guildconfig.mutedRole, `Muted by ${this.bot.tag(msg.author)} for ${reason}`);
      } catch (err) {
        return this.bot.embed("❌ Error", `Failed to add the muted role to **${user.username}**.`, msg, "error");
      }

      // Tries to DM user about their mute
      const dmchannel = await user.user.getDMChannel().catch(() => {});

      if (dmchannel) {
        dmchannel.createMessage({
          embed: {
            title: `🔇 Muted in ${msg.channel.guild.name}`,
            description: `You were muted for ${reason ? `\`${reason}\`` : "no reason provided."}`,
            color: this.bot.embed.color("error"),
            footer: {
              text: `Muted by ${this.bot.tag(msg.author)}`,
              icon_url: msg.author.dynamicAvatarURL(),
            },
          },
        }).catch(() => {});
      }

      this.bot.emit("memberMute", msg.channel.guild, msg.member, user, reason);
      this.bot.embed("✅ Success", `**${user.username}** was muted.`, msg, "success");
    } else {
      return this.bot.embed("❌ Error", `You don't have a high enough role to mute **${user.username}**.`, msg, "error");
    }
  }
}

module.exports = muteCommand;
