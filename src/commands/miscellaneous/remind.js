const { Snowflake } = require("../../utils/snowflake");
const Command = require("../../structures/Command");
const format = require("../../utils/format");

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
    if (!args[0] || args[0].toLowerCase() === "list") {
      let db = await this.bot.db.table("reminders").run();
      db = db.filter(d => d.user === msg.author.id);
      if (!db.length) return this.bot.embed("⏰ Reminders", "You don't have any reminders. Set one using remind <time> <reminder>.", msg);

      return msg.channel.createMessage({
        embed: {
          title: "⏰ Reminders",
          color: this.bot.embed.color("general"),
          fields: db.map(r => ({
            name: `${r.id}`,
            value: `${r.message}`,
          })),
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }

    // Reminder removal functionality
    if (args[0] && (args[0].toLowerCase() === "remove" || args[0].toLowerCase() === "delete")) {
      if (!args[1] || !args[1].length) return this.bot.embed("❌ Error", "You provided an invalid ID.", msg, "error");

      // If a user didn't set the reminder they provided
      const db = await this.bot.db.table("reminders").get(args[1]).run();
      if (db.user !== msg.author.id) return this.bot.embed("❌ Error", "You didn't create that reminder.", msg, "error");

      // Looks for the reminder; skips if it errored or skipped
      const reminder = await this.bot.db.table("reminders").get(args[1]).delete().run();
      if (reminder.skipped || reminder.errors) return this.bot.embed("❌ Error", "Reminder not found.", msg, "error");

      // Clears the timeout
      const handle = this.timeoutHandles.find(h => h.id === args[1]);
      if (handle) clearTimeout(handle);
      return this.bot.embed("⏰ Reminder", "Reminder removed.", msg);
    }

    // Time regex
    let val = 0;
    const finalArgs = [...args];
    args = args.join(" ").replace(
      // This regex looks so fucking stupid. But it works!
      /\d{1,2}( )?(w(eek(s)?)?)?(d(ay(s)?)?)?(h(our(s)?)?(r(s)?)?)?(m(inute(s)?)?(in(s)?)?)?(s(econd(s)?)?(ec(s)?)?)?( and( )?)?([, ]{1,2})?/ig, "",
    ).split(" ");

    // Parses the time given
    const timeArg = finalArgs.join(" ").substring(0, finalArgs.join(" ").indexOf(args.join(" ")));
    timeArg.split("").forEach((char, i) => {
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
            val += char * 604800000;
            break;
          case "d":
            val += char * 86400000;
            break;
          case "h":
            val += char * 3600000;
            break;
          case "m":
            val += char * 60000;
            break;
          case "s":
            val += char * 1000;
            break;
        }
      }
    });

    // Checks for valid time
    if (val < 1000) return this.bot.embed("❌ Error", "You provided an invalid amount of time.", msg, "error");
    const finaldate = new Date().getTime() + val;

    if (finaldate > new Date().getTime() + 2142720000) {
      return this.bot.embed("❌ Error", "The time amount must be under 25 days.", msg, "error");
    }

    // Creates the reminder
    const id = Snowflake();
    const reminder = {
      id: id,
      date: finaldate,
      user: msg.author.id,
      message: args.join(" "),
      set: new Date(),
    };

    // Sets timeout to send reminder
    const reminderDatabase = await this.bot.db.table("reminders").insert(reminder).run();
    if (!reminderDatabase.errors) {
      const handle = setTimeout(async r => {
        const db = await this.bot.db.table("reminders").get(r.id).run();
        const user = this.bot.users.get(r.user);
        if (!db || !user) return;
        const dm = await user.getDMChannel();
        if (!dm) return;

        // Sends the reminder
        await dm.createMessage({
          embed: {
            title: "⏰ Reminder",
            description: r.message,
            color: this.bot.embed.color("general"),
            footer: {
              text: `Set on ${format.date(r.set, false)}`,
              icon_url: this.bot.user.dynamicAvatarURL(),
            },
          },
        }).catch(() => {});

        this.timeoutHandles.push({ id: id, handle: handle });
        await this.bot.db.table("reminders").get(r.id).delete().run();
      }, reminder.date - new Date().getTime(), reminder);

      msg.channel.createMessage({
        embed: {
          title: "⏰ Reminder",
          description: `I'll remind you to ${args.join(" ")} in ${timeArg.split(" ").filter((a, i) => !(a.length === 0 || (a === " " && i === args.length))).join(" ")}.`,
          color: this.bot.embed.color("general"),
          fields: [{
            name: "ID",
            value: reminder.id,
          }],
          footer: {
            text: `Ran by ${this.bot.tag(msg.author)}`,
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      });
    }
  }
}

module.exports = remindCommand;
