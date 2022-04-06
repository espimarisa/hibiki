import type { Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class BlacklistCommand extends HibikiCommand {
  description = "Adds a guild or user to the blacklist.";
  ownerOnly = true;
  messageOnly = true;

  public async runWithMessage(message: Message, args: string[]) {
    // First argument is the type of blacklist.
    const type = args[0].toLowerCase();

    // Second argument is the ID of the guild or user.
    const id = args[1];

    // Check if the type is valid.
    if (!["guild", "server", "user"].includes(type)) {
      message.reply({
        embeds: [
          {
            title: message.getString("global.ERROR"),
            description: message.getString("global.INVALID_TYPE"),
            color: this.bot.config.colours.error,
          },
        ],
      });
      return;
    }

    // convert the type
    const blacklistType = type === "guild" || type === "server" ? "GUILD" : "USER";

    // List of blacklisted users/guilds if only a type arg was given
    if (args.length === 1) {
      const blacklist = await this.bot.db.getBlacklist(blacklistType);
      message.reply({
        embeds: [
          {
            title: message.getString("owner.COMMAND_BLACKLIST_TITLE"),
            description: blacklist
              .map(
                (i) =>
                  // This string is so confusing
                  `**${message.getString("global.ID")}*: \`${i.id}\`\n**${message.getString("global.TYPE")}**: \`${
                    i.type
                  }\`\n**${message.getString("global.REASON")}**: \`${i.reason}\``,
              )
              .join("\n\n"),
          },
        ],
      });
      return;
    }

    if (!id) {
      message.channel.send({
        embeds: [
          {
            title: message.getString("global.ERROR"),
            description: message.getString("global.INVALID_ID"),
            color: this.bot.config.colours.error,
          },
        ],
      });
      return;
    }

    let reason = args.slice(2).join(" ");
    if (reason.length === 0) reason = message.getString("global.NO_REASON_PROVIDED");

    // Blacklists guilds
    if (blacklistType === "GUILD") {
      const guild = this.bot.guilds.cache.find((guild) => guild.id === id);
      if (guild) await guild.leave().catch(() => {});

      await this.bot.db.insertBlacklistItem(id, reason, "GUILD");
      message.reply({
        embeds: [
          {
            title: message.getString("global.SUCCESS"),
            description: message.getString("owner.COMMAND_BLACKLIST_GUILD", {
              guild: guild?.name,
              id: guild?.id,
            }),
          },
        ],
      });
      return;
    }

    if (type === "user") {
      const user = this.bot.users.cache.find((user) => user.id === id);

      await this.bot.db.insertBlacklistItem(id, reason, "USER");
      message.reply({
        embeds: [
          {
            title: message.getString("global.SUCCESS"),
            description: message.getString("owner.COMMAND_BLACKLIST_USER", {
              user: user?.tag,
              id: user?.id,
            }),
          },
        ],
      });
      return;
    }
  }
}
