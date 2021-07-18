/**
 * @file Reminder handler
 * @description Checks every second to see if a reminder should send
 * @module scripts/reminders
 */

import type { HibikiClient } from "../classes/Client";
import { convertHex } from "../utils/embed";
import { dateFormat } from "../utils/format";

export class ReminderHandler {
  bot: HibikiClient;
  reminders: Reminder[] = [];

  constructor(bot: HibikiClient) {
    this.bot = bot;
    setTimeout(() => {
      this.bot.db.getAllReminders().then((reminders) => (this.reminders = reminders));

      setInterval(async () => {
        this.reminders.forEach(async (reminder: Reminder) => {
          if (Date.now() >= reminder.date) {
            const user = bot.users.get(reminder.user);
            if (!user) return;
            const dm = await user.getDMChannel().catch(() => {});
            if (!dm) return;

            // Deletes the reminder
            this.reminders.splice(this.reminders.indexOf(reminder), 1);
            await bot.db.deleteUserReminder(reminder.user, reminder.id);

            // Gets the user's locale
            const userLocale = await bot.localeSystem.getUserLocale(reminder.user);
            const string = bot.localeSystem.getLocaleFunction(userLocale);

            // Sends the user a message
            await dm.createMessage({
              embed: {
                title: `⏰ ${string("utility.REMINDER")}`,
                description: `${reminder.message}`,
                color: convertHex("general"),
                footer: {
                  text: `${string("utility.REMINDER_SETON", { date: dateFormat(reminder.set, string) })}`,
                  icon_url: bot.user.dynamicAvatarURL(),
                },
              },
            });
          }
        });
      }, 2000);
    }, 10000);
  }
}
