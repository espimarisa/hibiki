import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class CleanCommand extends Command {
  description = "Deletes the last certain number of messages (defaults to 10) from the bot.";
  args = "[amount:number]";
  clientperms = ["manageMessages"];
  requiredperms = ["manageMessages"];
  staff = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    // Gets the amount to purge
    let amount = parseInt(args.join(" "));
    if (!amount || isNaN(amount)) amount = 10;
    else if (amount > 200) amount = 200;

    // Deletes the messages
    msg.channel.purge(amount, (m) => m.author.id === this.bot.user.id).catch(() => {});

    // Sends a confirmation message and deletes it quickly
    const cleanmsg = await msg.createEmbed(
      `💣 ${msg.string("moderation.PURGE")}`,
      msg.string("moderation.CLEAN_CLEANED", {
        author: msg.tagUser(msg.author),
        amount: amount,
      }),
    );
    setTimeout(() => {
      cleanmsg.delete().catch(() => {});
    }, 2000);
  }
}
