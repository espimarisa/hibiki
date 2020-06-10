const Command = require("structures/Command");
const { Snowflake } = require("utils/Snowflake");

class remindCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["remindme", "reminder", "reminders"],
      args: "[time:string] [reminder:string]",
      description: "Sends a reminder to you later on.",
      cooldown: 3,
    });
    this.timeoutHandles = [];
  }

  async run(msg, args) {
    // List member's reminders
    if (args[0] === undefined || args[0].toLowerCase() === "list") {
      let db = await this.bot.db.table("reminders");
      db = db.filter(d => d.user === msg.author.id);
      if (!db.length) return msg.channel.createMessage(this.bot.embed("⏰ Reminders", "You don't have any reminders."));

      return msg.channel.createMessage({
        embed: {
          title: "⏰ Reminders",
          color: this.bot.embed.color("general"),
          fields: db.map(r => ({
            name: `${r.id}`,
            value: `${r.message}`,
          })),
        },
      });
    }

    // Removing reminders
    if (args[0] !== undefined && (args[0].toLowerCase() === "remove" || args[0].toLowerCase() === "delete")) {
      if (!args[1] || !args[1].length) return msg.channel.createMessage(this.bot.embed("❌ Error", "You provided an invalid ID.", "error"));
      const db = await this.bot.db.table("reminders").get(args[1]);
      if (db.user !== msg.author.id) return msg.channel.createMessage(this.bot.embed("❌ Error", "You didn't create that reminder.", "error"));
      const reminder = await this.bot.db.table("reminders").get(args[1]).delete();
      if (reminder.skipped || reminder.errors) return msg.channel.createMessage(this.bot.embed("❌ Error", "Reminder not found.", "error"));
      // Clears the timeout
      const handle = this.timeoutHandles.find(h => h.id === args[1]);
      if (handle) clearTimeout(handle);
      return msg.channel.createMessage(this.bot.embed("⏰ Reminder", `Reminder removed.`));
    }

    let val = 0;
    const fargs = [...args];
    // Time regex
    args = args.join(" ").replace(/\d{1,2}( )?(w(eek(s)?)?)?(d(ay(s)?)?)?(h(our(s)?)?(r(s)?)?)?(m(inute(s)?)?(in(s)?)?)?(s(econd(s)?)?(ec(s)?)?)?( and( )?)?([, ]{1,2})?/i, "").split(" ");
    const timeArg = fargs.join(" ").substring(0, fargs.join(" ").indexOf(args.join(" ")));
    const validtime = [];
    timeArg.split("").forEach((char, i) => {
      if (isNaN(parseInt(char))) return;
      if (i === timeArg.length - 1) return;
      let v = timeArg[i + 1].toLowerCase();
      if (!isNaN(parseInt(timeArg[i + 1])) && !isNaN(parseInt(char))) return;
      if (!isNaN(parseInt(char)) && !isNaN(parseInt(timeArg[i - 1]))) char = `${timeArg[i - 1]}${char}`;
      if (timeArg[i + 2] && (v === " " || v === ",") && /[wdhms]/.exec(timeArg[i + 2].toLowerCase())) v = timeArg[i + 2];
      // Time switcher
      if (isNaN(parseInt(v))) {
        switch (v) {
          case "w":
            val += char * 604800000;
            validtime.push(`${char} week${char > 1 ? "s" : ""}`);
            break;
          case "d":
            val += char * 86400000;
            validtime.push(`${char} day${char > 1 ? "s" : ""}`);
            break;
          case "h":
            val += char * 3600000;
            validtime.push(`${char} hour${char > 1 ? "s" : ""}`);
            break;
          case "m":
            val += char * 60000;
            validtime.push(`${char} minute${char > 1 ? "s" : ""}`);
            break;
          case "s":
            val += char * 1000;
            validtime.push(`${char} second${char > 1 ? "s" : ""}`);
            break;
        }
      }
    });

    // Invalid time
    if (val < 1000) return msg.channel.createMessage(this.bot.embed("❌ Error", "You provided an invalid amount of time.", "error"));
    const finaldate = new Date().getTime() + val;
    if (finaldate > new Date().getTime() + 2142720000) return msg.channel.createMessage(this.bot.embed("❌ Error", "The time amout must be under 25 days.", "error"));

    // Creates the reminder
    const id = Snowflake();
    const reminder = {
      id: id,
      date: finaldate,
      user: msg.author.id,
      message: args.join(" "),
    };

    // Sets timeout to send reminder
    const rdb = await this.bot.db.table("reminders").insert(reminder);
    if (!rdb.errors) {
      const handle = setTimeout(async (r) => {
        const db = await this.bot.db.table("reminders").get(r.id);
        if (!db) return;
        const user = this.bot.users.get(r.user);
        if (!user) return;
        const dm = await user.getDMChannel();
        if (!dm) return;
        // Sends the reminder message in DMs
        await dm.createMessage({
          embed: {
            title: "⏰ Reminder",
            description: r.message,
            color: this.bot.embed.color("general"),
          },
        }).catch(() => {});
        this.timeoutHandles.push({ id: id, handle: handle });
        await this.bot.db.table("reminders").get(r.id).delete();
      }, reminder.date - new Date().getTime(), reminder);

      msg.channel.createMessage({
        embed: {
          title: "⏰ Reminder",
          description: `I'll remind you to ${args.join(" ")} in ${validtime.join(" ")}.`,
          color: this.bot.embed.color("general"),
          fields: [{
            name: "ID:",
            value: reminder.id,
          }],
        },
      });
    }
  }
}

module.exports = remindCommand;
