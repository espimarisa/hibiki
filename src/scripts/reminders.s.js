/**
 * @fileoverview Reminders script
 * @description Handles reminders if the bot goes offline
 * @module script/reminders
 */

const format = require("../utils/format");

module.exports = async bot => {
  const reminderdb = await bot.db.table("reminders").run();
  reminderdb.forEach(rd => {
    // Sets a timeout
    setTimeout(async r => {
      const db = await bot.db.table("reminders").get(r.id).run();
      if (!db) return;
      const user = bot.users.get(r.user);
      if (!user) return;
      const dm = await user.getDMChannel();
      if (!dm) return;

      // Sends the reminder
      await dm.createMessage({
        embed: {
          title: "⏰ Reminder",
          description: `${r.message}`,
          color: bot.embed.color("general"),
          footer: {
            text: `Set on ${format.date(r.set, false)}`,
            icon_url: bot.user.dynamicAvatarURL(),
          },
        },
      }).catch(() => {});

      // Removes the reminder
      await bot.db.table("reminders").get(r.id).delete().run();
    }, rd.date - new Date(), rd);
  });
};
