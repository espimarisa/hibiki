import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class WhiteListCommand extends Command {
  description = "Whitelists a user or guild.";
  args = "<target:string>";
  allowdms = true;
  allowdisable = false;
  owner = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const target = args[0];
    if (isNaN(parseInt(target))) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("owner.BLACKLIST_INVALID"), "error");
    await this.bot.db.deleteBlacklistedItem(target);
    msg.createEmbed(msg.locale("global.SUCCESS"), `${msg.locale("owner.WHITELIST_WHITELISTED", { target: target })}`, "success");
  }
}
