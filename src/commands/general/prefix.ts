import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import config from "../../../config.json";

export class PrefixCommand extends Command {
  description = "Views or changes the bot's prefix.";
  args = "[prefix:string]";

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    // Looks for custom prefix
    const prefix = args.join(" ").trim();
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);

    if (!args.length && !guildconfig?.prefix) {
      return msg.createEmbed("🤖 Prefix", `The prefix in this server is \`${config.prefixes[0]}\`.`);
    }

    // If there's a prefix & no args
    if (!args.length) return msg.createEmbed("🤖 Prefix", `The prefix in this server is \`${guildconfig.prefix}\`.`);

    // If no guildconfig
    if (!guildconfig?.prefix) await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);

    if (prefix.length > 15) return msg.createEmbed("❌ Error", "The max prefix length is 15 characters.", "error");

    // Lets members without permission check but not set
    if (!msg.member.permissions.has("manageGuild")) {
      return msg.createEmbed("❌ Error", "You don't have permission to set the prefix.", "error");
    }

    // Updates DB
    await this.bot.db.updateGuildConfig(msg.channel.guild.id, { prefix: prefix });

    this.bot.emit("prefixUpdate", msg.channel.guild, msg.member, prefix);
    msg.createEmbed("✅ Success", `The prefix was set to \`${prefix}\`.`, "success");
  }
}
