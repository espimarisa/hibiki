/**
 * @file Divorce command
 * @description Ends executor's marriage if they're in one.
 */

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
    if (!state?.length) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("fun.DIVORCE_NOTMARRIED"), "error");

    // Asks for confirmation
    const divorcemsg = await msg.createEmbed(`💔 ${msg.locale("fun.DIVORCE")}`, msg.locale("fun.DIVORCE_CONFIRMATION"));
    const response = (await askYesNo(this.bot, msg.locale, msg.author.id, msg.channel.id).catch((err) => {
      return timeoutHandler(err, divorcemsg, msg.locale);
    })) as ResponseData;

    // If divorce is cancelled
    if (response?.response === false) {
      return divorcemsg.editEmbed(`💔 ${msg.locale("fun.DIVORCE")}`, msg.locale("fun.DIVORCE_CANCELLED"));
    }

    // Divorces
    await this.bot.db.deleteUserMarriage(msg.author.id);
    divorcemsg.editEmbed(`💔 ${msg.locale("fun.DIVORCE")}`, msg.locale("fun.DIVORCE_DIVORCED"));
  }
}
