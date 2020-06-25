/*
  Sends reminders if the bot was restarted.
*/

module.exports = async (bot) => {
  // Loads all reminders
  const reminderdb = await bot.db.table("reminders").run();
  reminderdb.forEach(rd => {
    // Sets a timeout
    setTimeout(async (r) => {
      const db = await bot.db.table("reminders").get(r.id).run();
      if (!db) return;
      const user = bot.users.get(r.user);
      if (!user) return;
      const dm = await user.getDMChannel();
      if (!dm) return;
      // Removes the reminder
      await dm.createMessage(bot.embed("⏰ Reminder", `${r.message}`)).catch(() => {});
      await bot.db.table("reminders").get(r.id).delete().run();
    }, rd.date - new Date(), rd);
  });
};
