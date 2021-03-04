import type { Message, TextChannel } from "eris";
import type { ResponseData } from "../../typings/utils";
import { Command } from "../../classes/Command";
import { askYesNo } from "../../utils/ask";
import { timeoutHandler } from "../../utils/waitFor";

export class DivorceCommand extends Command {
  description = "Ends your marriage if you're in one.";
  aliases = ["demarry", "unmarry"];

  async run(msg: Message<TextChannel>) {
    // Gets marriage state
    const state = await this.bot.db.getUserMarriage(msg.author.id);
    if (!state?.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("fun.DIVORCE_NOTMARRIED"), "error");

    // Asks for confirmation
    const divorcemsg = await msg.createEmbed(`💔 ${msg.string("fun.DIVORCE")}`, msg.string("fun.DIVORCE_CONFIRMATION"));
    const response = (await askYesNo(this.bot, msg.string, msg.author.id, msg.channel.id).catch((err) => {
      return timeoutHandler(err, divorcemsg, msg.string);
    })) as ResponseData;

    // If divorce is cancelled
    if (typeof response?.response !== "boolean") return;
    if (response?.response === false) {
      return divorcemsg.editEmbed(`💔 ${msg.string("fun.DIVORCE")}`, msg.string("fun.DIVORCE_CANCELLED"));
    }

    // Divorces
    await this.bot.db.deleteUserMarriage(msg.author.id);
    divorcemsg.editEmbed(`💔 ${msg.string("fun.DIVORCE")}`, msg.string("fun.DIVORCE_DIVORCED"));
  }
}
