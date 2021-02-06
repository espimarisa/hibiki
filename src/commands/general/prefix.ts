import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class PrefixCommand extends Command {
  description = "Views or changes the bot's prefix.";
  args = "[prefix:string]";

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Looks for custom prefix
    const prefix = args.join(" ").trim();
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    if (!args.length && !guildconfig?.prefix) {
      return msg.createEmbed(
        `🤖 ${msg.string("global.PREFIX")}`,
        `${msg.string("global.SERVER_PREFIX", { prefix: this.bot.config.prefixes[0] })}`,
      );
    }

    // If there's a prefix & no args
    if (!args.length) {
      return msg.createEmbed(`🤖 ${msg.string("global.PREFIX")}`, `${msg.string("global.SERVER_PREFIX", { prefix: guildconfig.prefix })}`);
    }

    // Too long prefix
    if (prefix.length > 15) return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.PREFIX_TOOLONG"), "error");

    // Lets members without permission check but not set
    if (!msg.member.permissions.has("manageGuild") || (guildconfig?.staffRole && !msg.member?.roles?.includes(guildconfig.staffRole))) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("general.PREFIX_NOPERMISSIONS"), "error");
    }

    // Updates DB
    await this.bot.db.updateGuildConfig(msg.channel.guild.id, { id: msg.channel.guild.id, prefix: prefix });

    this.bot.emit("prefixUpdate", msg.channel.guild, msg.member, prefix);
    msg.createEmbed(msg.string("global.SUCCESS"), msg.string("general.PREFIX_SET", { prefix: prefix }), "success");
  }
}
