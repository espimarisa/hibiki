import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class LogsCommand extends Command {
  description = "Sends the most recent bot logs.";
  args = "[command:string] | [clear:string]";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // If no logs exist
    if (!this.bot.logs) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("owner.LOGS_NOLOGS"), "error");

    // Handler for log clearing
    if (["clear", msg.locale("global.CLEAR")].includes(args?.[0]?.toLowerCase())) {
      this.bot.logs = [];
      return msg.createEmbed(`📜 ${msg.locale("owner.LOGS")}`, msg.locale("owner.LOGS_CLEARED"), "success");
    }

    // Sends logs about a specific command
    if (args.length) {
      const cmd = this.bot.commands.find(
        (c) => c.name === args.join(" ").toLowerCase() || c.aliases.includes(args.join(" ").toLowerCase()),
      );

      // Filters through the logs
      if (!cmd) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("owner.COMMAND_NOTFOUND"), "error");
      let cmdlogs = [];
      cmdlogs = this.bot.logs.filter((l) => l.cmdName === cmd.name);

      return msg.createEmbed(
        `📜 ${msg.locale("owner.LOGS")}`,
        msg.locale("owner.LOGS_COMMAND", {
          command: cmd.name,
          times: cmdlogs.length,
        }),
      );
    }

    // Formats last 20 logs to human readable ones
    const humanReadableLogs = this.bot.logs
      .slice(this.bot.logs.length - 20, this.bot.logs.length)
      .map((log) => {
        const logTime =
          // Formats log time
          msg.timestamp / 1000 - log.date / 1000 > 60
            ? `**${(msg.timestamp / 60000 - log.date / 60000).toFixed(1)}** mins ago`
            : `**${(msg.timestamp / 1000 - log.date / 1000).toFixed(1)}** secs ago`;

        // Returns human readable logs
        return `${logTime}: **${msg.tagUser(this.bot.users.get(log.authorID)) || log.authorID}** ran **${log.cmdName}** in **${
          this.bot.guilds.get(log.guildID)?.name || log.guildID
        }** (${log.guildID}) ${log.args.length ? `:\`${log.args.join(" ")}\`` : ""}`;
      })
      .join("\n");

    msg.createEmbed(`📜 ${msg.locale("owner.LOGS")}`, humanReadableLogs);
  }
}
