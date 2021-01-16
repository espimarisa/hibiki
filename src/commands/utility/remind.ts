import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { validTimeRegex } from "../../helpers/constants";
import { dateFormat } from "../../utils/format";
import { generateSnowflake } from "../../utils/snowflake";

export class RemindCommand extends Command {
  description = "Sends a reminder to you at a later time.";
  args = "[time:string] [reminder:string]";
  aliases = ["remindme", "reminder", "reminders"];
  cooldown = 3000;
  allowdms = true;
  timeoutHandles: any[] = [];

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs, args: string[]) {
    // Reminder list functionality
    if (!args[0] || args?.[0]?.toLowerCase() === "list") {
      const reminders = await this.bot.db.getUserReminders(msg.author.id);
      if (!reminders?.length) return msg.createEmbed(`⏰ ${msg.string("utility.REMINDERS")}`, msg.string("utility.REMINDERS_NONE"));

      return msg.channel.createMessage({
        embed: {
          title: `⏰ ${msg.string("utility.REMINDERS")}`,
          color: msg.convertHex("general"),
          fields: reminders.map((r) => ({
            name: `${r.id}`,
            value: `${r.message}`,
          })),
          footer: {
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }

    // Reminder removal functionality
    if (args?.[0]?.toLowerCase() === "remove" || args?.[0]?.toLowerCase() === "delete") {
      if (!args?.[1]?.length) return msg.createEmbed(msg.string("global.ERROR"), msg.string("global.ERROR_INVALIDID"), "error");

      // Deletes the reminder
      const reminder = await this.bot.db.deleteUserReminder(args[1], msg.author.id);
      if (!reminder.deleted) return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.REMINDER_NOTFOUND"), "error");

      // Clears the timeout
      const handle = this.timeoutHandles.find((h) => h.id === args[1]);
      if (handle) clearTimeout(handle);
      return msg.createEmbed(`⏰ ${msg.string("utility.REMINDER")}`, msg.string("utility.REMINDER_REMOVED"));
    }

    // Gets valid time
    let time = 0;
    const finalArgs = [...args];
    args = args.join(" ").replace(validTimeRegex, "").split(" ");

    // Parses the time given
    const timeArg = finalArgs.join(" ").substring(0, finalArgs.join(" ").indexOf(args.join(" ")));
    timeArg.split("").forEach((char: string, i: number) => {
      // Returns if it isn't a proper value
      if (isNaN(parseInt(char))) return;
      if (i === timeArg.length - 1) return;
      let value = timeArg[i + 1].toLowerCase();
      if (!isNaN(parseInt(timeArg[i + 1])) && !isNaN(parseInt(char))) return;
      if (!isNaN(parseInt(char)) && !isNaN(parseInt(timeArg[i - 1]))) char = `${timeArg[i - 1]}${char}`;
      if (timeArg[i + 2] && (value === " " || value === ",") && /[wdhms]/.exec(timeArg[i + 2].toLowerCase())) value = timeArg[i + 2];

      // Gets exact time given
      if (isNaN(parseInt(value))) {
        switch (value) {
          case "w":
            time += parseInt(char) * 604800000;
            break;
          case "d":
            time += parseInt(char) * 86400000;
            break;
          case "h":
            time += parseInt(char) * 3600000;
            break;
          case "m":
            time += parseInt(char) * 60000;
            break;
          case "s":
            time += parseInt(char) * 1000;
            break;
        }
      }
    });

    // Gets final date and time
    if (time < 1000) return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.REMINDER_INVALIDTIME"), "error");
    const finalDate = new Date().getTime() + time;
    const finalTime = timeArg
      .split(" ")
      .filter((a, i) => !(a.length === 0 || (a === " " && i === args.length)))
      .join(" ");

    // Creates the reminder
    const id = generateSnowflake();
    const reminder = {
      id: id,
      date: finalDate,
      user: msg.author.id,
      message: args.join(" "),
      set: new Date(),
    };

    // Inserts the reminder and sets a timeout
    await this.bot.db.insertUserReminder(reminder);
    this.bot.reminderHandler.reminders.push(reminder);

    // Sends confirmation message
    msg.channel.createMessage({
      embed: {
        title: `⏰ ${msg.string("utility.REMINDER_SET")}`,
        description: msg.string("utility.REMINDER_INFO", { reminder: args.join(" "), time: finalTime }),
        color: msg.convertHex("general"),
        fields: [
          {
            name: msg.string("global.ID"),
            value: reminder.id,
          },
          {
            name: msg.string("global.DATE"),
            value: dateFormat(reminder.date),
          },
        ],
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
