/*
  This logs when a message is updated or deleted.
*/

bot.on("messageDelete", async message => {
  console.log(message);
});
