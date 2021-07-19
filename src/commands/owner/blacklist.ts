import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class BlackListCommand extends Command {
  description = "Blacklists a user or guild from using the bot.";
  args = "[type:string] [target:string] [reason:string]";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // List of blacklisted users/guilds if no args given
    if (!args?.[0]) {
      const blacklist = await this.bot.db.getBlacklist();
      return msg.createEmbed(
        `❌ ${msg.locale("owner.BLACKLIST")}`,
        blacklist
          .map(
            (i) =>
              `**${msg.locale("global.ID")}*: \`${i.id}\`\n**${msg.locale("owner.TYPE")}**: \`${
                i.user ? msg.locale("global.USER") : msg.locale("global.GUILD")
              }\`\n**${msg.locale("global.REASON")}**: \`${i.reason}\``,
          )
          .join("\n\n"),
        "error",
      );
    }

    // Gets the type and target
    const type = args[0];
    const target = args[1];
    if (isNaN(parseInt(target))) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("owner.BLACKLIST_INVALID"), "error");

    // Gets the reason
    let reason = args.slice(2).join(" ");
    if (!reason.length) reason = msg.locale("global.NO_REASON");
    else if (reason.length > 512) reason = reason.slice(0, 512);

    // Blacklists guilds
    if (type === "guild" || type === "server") {
      const guild = this.bot.guilds.find((guild) => guild.id === target);
      if (guild) await guild.leave().catch(() => {});
      await this.bot.db.insertBlacklistedItem({ id: target, reason: reason, guild: true });
      msg.createEmbed(
        msg.locale("global.SUCCESS"),
        msg.locale("owner.BLACKLISTED_GUILD", { guild: guild?.name ? guild.name : target }),
        "success",
      );
    }

    // Blacklists users; fallback to blacklisting users if no type is given
    else if (type === "user") {
      const user = this.bot.users.get(target);
      await this.bot.db.insertBlacklistedItem({ id: target, reason: reason, user: true });
      msg.createEmbed(
        msg.locale("global.SUCCESS"),
        msg.locale("owner.BLACKLISTED_USER", { user: user?.username ? user.username : target }),
        "success",
      );
    }
  }
}
