import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { itemExists } from "../../utils/itemExists";

export class AgreeCommand extends Command {
  description = "Gives you the set agree role if the server has it configured.";

  async run(msg: Message<TextChannel>) {
    const guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig?.agreeRole || !guildconfig.agreeChannel) return;

    // Checks if the channel and role exists
    const channelCheck = itemExists(msg.channel.guild, "channel", guildconfig.agreeChannel, this.bot.db, "agreeChannel");
    if (!channelCheck) return;
    const roleCheck = itemExists(msg.channel.guild, "role", guildconfig.agreeRole, this.bot.db, "agreeRole");
    if (!roleCheck) return;

    // If a member already has the role
    if (msg.member?.roles?.includes(guildconfig.agreeRole)) return;

    // Adds the role
    await msg.member
      ?.addRole(guildconfig.agreeRole, "Ran the agree command")
      .then(() => {
        msg.delete();
      })
      .catch(() => {});
  }
}
