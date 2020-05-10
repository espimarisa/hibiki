/*
  Sends reminders if the bot was restarted.
*/

module.exports = async (bot) => {
  // Reads the DB
  const reminderdb = await bot.db.table("reminders");
  // Loads all reminders
  reminderdb.forEach(rd => {
    // Sets a timeout for reminders
    setTimeout(async (r) => {
      // Gets the reminders table
      const db = await bot.db.table("reminders").get(r.id);
      if (!db) return;
      // Gets the users
      const user = bot.users.get(r.user);
      if (!user) return;
      const dm = await user.getDMChannel();
      if (!dm) return;
      // Sends the reminder message
      await dm.createMessage(bot.embed("⏰ Reminder", `${r.message}`)).catch(() => {});
      // Removes the reminder from the db
      await bot.db.table("reminders").get(r.id).delete();
    }, rd.date - new Date(), rd);
  });
};
