const Command = require("../../structures/Command");
const format = require("../../utils/format");
const dayjs = require("dayjs");
const pronouns = ["No preference", "He/Him", "She/Her", "They/Them"];

// Dayjs plugins
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
dayjs.extend(utc);
dayjs.extend(timezone);

class userCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Returns info about you or another member.",
      aliases: ["profile", "uinfo", "userinfo"],
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    let pointcount = 0;
    let warningcount = 0;
    let spouseid;

    // Gets user's (custom) status; removes custom emojis
    let playing = user.game && user.game.name.trim() ? user.game.name.trim() : "";
    if (user.game && user.game.type === 4) {
      if (user.game.emoji && user.game.emoji.name && !user.game.emoji.id) playing = `${user.game.emoji.name} ${user.game.state || ""}`;
      else playing = user.game.state;
    }

    // Spotify & playing
    if (user && user.activities !== undefined) {
      const song = user.activities.find(s => s.id === "spotify:1");
      const game = user.activities.find(s => s.id !== "spotify:1" && s.id !== "custom");
      if (song && !game) playing = `${song.details} \n` + `by ${song.state} \n` + `on ${song.assets.large_text}`;
      else if (game) playing = `${game.name}`;
    }

    // Formats statustypes
    let playingname;
    if (user.game) {
      switch (user.game.type) {
        case 0:
          playingname = "Playing";
          break;
        case 1:
          playingname = "Streaming";
          break;
        case 2:
          playingname = "Listening to";
          break;
        case 3:
          playingname = "Watching";
          break;
        case 4:
          playingname = `${user.activities?.find(s => s.id === "spotify:1") ? "Listening to" : "Custom Status"}`;
          break;
        default:
          playingname = "Unknown";
          break;
      }

      if (user && user.activities && user.activities.find(s => s.id !== "spotify:1" && s.id !== "custom")) playingname = "Playing";
    } else playingname = "Playing";


    // Formats statuses
    function formatStatus(status) {
      switch (status) {
        case "online":
          return "Online";
        case "idle":
          return "Idle";
        case "dnd":
          return "Do Not Disturb";
        case "offline":
          return "Invisible/Offline";
        case undefined:
          return "Invisible/Offline";
        default:
          return status;
      }
    }

    // Gets database items
    const cookies = await this.bot.db.table("economy").get(user.id).run();
    const points = await this.bot.db.table("points").run();
    const userconfig = await this.bot.db.table("userconfig").get(user.id).run();
    const warnings = await this.bot.db.table("warnings").run();
    const [spouse] = await this.bot.db.table("marriages").getAll(user.id, { index: "marriages" }).run();
    if (spouse) spouseid = spouse.id === user.id ? spouse.spouse : spouse.id;
    points.forEach(p => { if (p.guild === msg.channel.guild.id && p.receiver === user.id) pointcount++; });
    warnings.forEach(w => { if (w.guild === msg.channel.guild.id && w.receiver === user.id) warningcount++; });

    // Gets user's current time
    let timeForUser;
    let timezone;
    const currentTime = new Date();
    if (!userconfig || !userconfig.timezone || userconfig && userconfig.timezoneHide === true) timeForUser = null;
    else timezone = dayjs(currentTime).tz(userconfig.timezone);
    if (!timezone || !timezone.$d) timeForUser = null;
    else timeForUser = format.date(timezone.$d);

    // Embed constructor
    const fields = [];
    fields.push({
      name: "ID",
      value: user.id,
      inline: true,
    });

    fields.push({
      name: "Account",
      value: `Created on ${format.date(user.createdAt)} \n` + `Joined on ${format.date(user.joinedAt)}`,
    });

    if (playing) fields.push({
      name: playingname,
      value: `${playing}`,
      inline: false,
    });

    if (user.nick) fields.push({
      name: "Nickname",
      value: `${user.nick}`,
      inline: true,
    });

    fields.push({
      name: "Status",
      value: formatStatus(user.status),
      inline: true,
    });

    if (user.roles.length) fields.push({
      name: "Highest Role",
      value: `${user.highestRole.name}`,
      inline: true,
    });

    if (userconfig && userconfig.pronouns && userconfig.pronouns !== 0) fields.push({
      name: "Pronouns",
      value: pronouns[userconfig.pronouns],
      inline: true,
    });

    if (timeForUser !== null) fields.push({
      name: "Current Time",
      value: `${timeForUser}`,
      inline: true,
    });

    if (spouse) fields.push({
      name: "Married To",
      value: `${spouseid ? this.bot.users.find(m => m.id === spouseid) ? this.bot.users.find(m => m.id === spouseid).username : `<@!${spouseid}>` : "Nobody"}`,
      inline: true,
    });

    if (cookies && cookies.amount > 0 || pointcount || warningcount) fields.push({
      name: "Bot Stats",
      value: `${pointcount ? `${pointcount} point${pointcount === 1 ? "" : "s"}` : ""} \n` +
        `${warningcount ? `${warningcount} warning${warningcount === 1 ? "" : "s"} \n` : ""}` +
        `${cookies && cookies.amount > 0 ? `${cookies.amount} cookie${cookies.amount === 1 ? "" : "s"}` : ""}`,
      inline: false,
    });


    msg.channel.createMessage({
      embed: {
        description: userconfig && userconfig.bio ? userconfig.bio : null,
        color: this.bot.embed.color("general"),
        fields: fields,
        author: {
          icon_url: user.user.dynamicAvatarURL(null),
          name: this.bot.tag(user.user),
        },
        thumbnail: {
          url: user.user.dynamicAvatarURL(null),
        },
        footer: {
          text: `Ran by ${this.bot.tag(msg.author)}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}

module.exports = userCommand;
