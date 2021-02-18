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

    // Gets the last 200 messageIs and filters for bot messages
    const msgs = await msg.channel.getMessages(200);
    const botMessages = msgs.filter((m) => m.author.id === this.bot.user.id);
    const messagesToPurge = botMessages.map((m) => m.id).splice(botMessages.length - amount, botMessages.length);

    // Deletes the messages
    await msg.channel.deleteMessages(messagesToPurge, `Cleaned by ${msg.tagUser(msg.author, true)}`).catch(() => {});

    // Sends a confirmation message and deletes it quickly
    const cleanmsg = await msg.createEmbed("💣 Clean", "Deleted the **last 10** messages from me.");
    setTimeout(() => {
      cleanmsg.delete().catch(() => {});
    }, 2000);
  }
}
