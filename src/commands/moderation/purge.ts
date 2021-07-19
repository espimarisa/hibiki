import type { Member, Message, TextChannel, User } from "eris";
import type { ResponseData } from "../../typings/utils";
import { Command } from "../../classes/Command";
import { imageFileTypes, urlRegex } from "../../utils/constants";
import { askYesNo } from "../../utils/ask";
import { timeoutHandler } from "../../utils/waitFor";
const limit = 200;

export class PurgeCommand extends Command {
  description = "Mass deletes a certain amount of messages or messages with certain types of content.";
  clientperms = ["manageMessages"];
  requiredperms = ["manageMessages"];
  args = "<amount:number> [member:member] [links:string] | [images:string] | [files:string] [bots:string]";
  aliases = ["clear", "delete", "nuke", "p"];
  cooldown = 5000;
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    let amount = parseInt(args[0]);
    let member: Member | User;

    // Handles invalid amounts
    if (isNaN(amount) || amount <= 0) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.PURGE_INVALIDAMOUNT"), "error");
    }

    // Trims the amount to the limit
    if (amount > limit) amount = limit;
    amount = Math.round(amount);

    // Finds a member to purge messages from
    if (args[1]) member = await this.bot.args.argtypes.member(args[1], msg, ["userFallback", "strict"]);

    // Waits for response
    const purgmsg = await msg.createEmbed(
      `💣 ${msg.locale("moderation.PURGE")}`,
      msg.locale("moderation.PURGE_CONFIRMATION", { amount: amount }),
    );

    const response = (await askYesNo(this.bot, msg.locale, msg.author.id, msg.channel.id).catch((err) =>
      timeoutHandler(err, purgmsg, msg.locale),
    )) as ResponseData;

    // If cancelled
    if (!response || response?.response === false) {
      return purgmsg.editEmbed(`💣 ${msg.locale("moderation.PURGE")}`, msg.locale("moderation.PURGE_CANCELLED"));
    }

    let purgedmsgs = 0;
    // Purges the messages
    try {
      await msg.channel
        .purge(
          amount + 3,
          (m) => {
            if (member && m.author.id !== member.id) return false;
            if (args.includes("bots") && !m.author?.bot) return false;
            if (args.includes("files") && !m.attachments?.length) return false;
            if (args.includes("links") && !urlRegex.test(m.content)) return false;
            if (args.includes("images") && !m.attachments?.some((a) => imageFileTypes.some((img) => a.url?.endsWith(img)))) return false;
            purgedmsgs++;
            return true;
          },
          null,
          null,
          `Purged by ${msg.tagUser(msg.author, true)}`,
        )
        .catch(() => {});
    } catch (err) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.PURGE_ERROR"), "error");
    }

    // Sends a confirmation message and deletes it
    const finalmsg = await msg.createEmbed(
      `💣 ${msg.locale("moderation.PURGE")} `,
      msg.locale("moderation.PURGE_PURGED", { author: msg.tagUser(msg.author), amount: args.length > 1 ? purgedmsgs : purgedmsgs - 3 }),
    );

    // Deletes the message
    setTimeout(async () => {
      await finalmsg.delete().catch(() => {});
    }, 5000);
  }
}
