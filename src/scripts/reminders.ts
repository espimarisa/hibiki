/**
 * @file Reminder handler
 * @description Checks every second to see if a reminder should send
 * @module scripts/reminders
 */

import type { HibikiClient } from "../classes/Client";
import { convertHex } from "../helpers/embed";
import { dateFormat } from "../utils/format";

export class ReminderHandler {
  bot: HibikiClient;
  reminders: Reminder[] = [];

  constructor(bot: HibikiClient) {
    this.bot = bot;
    setTimeout(() => {
      this.bot.db.getAllReminders().then((reminders) => (this.reminders = reminders));

      setInterval(async () => {
        this.reminders.forEach(async (reminder: Reminder, i: number) => {
          if (Date.now() >= reminder.date) {
            const user = bot.users.get(reminder.user);
            if (!user) return;
            const dm = await user.getDMChannel().catch(() => {});
            if (!dm) return;

            // Gets the user's locale
            const userLocale = await bot.localeSystem.getUserLocale(reminder.user, bot);
            const string = bot.localeSystem.getLocaleFunction(userLocale);

            // Sends the user a message
            await dm
              .createMessage({
                embed: {
                  title: `⏰ ${string("utility.REMINDER")}`,
                  description: `${reminder.message}`,
                  color: convertHex("general"),
                  footer: {
                    text: `${string("utility.REMINDER_SETON", { date: dateFormat(reminder.set, string) })}`,
                    icon_url: bot.user.dynamicAvatarURL(),
                  },
                },
              })
              .catch(() => {});

            // Deletes the reminder
            bot.db.deleteUserReminder(reminder.user, reminder.id);
            this.reminders.splice(i);
          }
        });
      }, 1_0_0_0);
    }, 1_0_0_0_0);
  }
}
