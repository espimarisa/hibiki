const Command = require("structures/Command");
const format = require("utils/format");

class userCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "[member:member&fallback]",
      description: "Returns info about a member.",
      aliases: ["profile", "uinfo", "userinfo"],
    });
  }

  async run(msg, args, pargs) {
    const user = pargs[0].value;
    const fields = [];
    let pointcount = 0;
    let warningcount = 0;
    let spouseid;

    // Gets user's (custom) status; removes custom emojis
    let playing = user.game && user.game.name.trim() ? user.game.name.trim() : "";
    if (user.game && user.game.type === 4) {
      if (user.game.emoji && user.game.emoji.name && !user.game.emoji.id) playing = `${user.game.emoji.name} ${user.game.state || ""}`;
      else playing = user.game.state;
    }

    // Spotify song details
    if (user.game && user.game.type === 2 && user.activities) {
      const song = user.activities.find(s => s.id === "spotify:1");
      if (song) playing = `${song.details} \n` + `by ${song.state} \n` + `on ${song.assets.large_text}`;
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
          playingname = "Custom Status";
          break;
        default:
          playingname = "Unknown";
          break;
      }
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
    const usercfg = await this.bot.db.table("usercfg").get(user.id).run();
    const warnings = await this.bot.db.table("warnings").run();
    const [spouse] = await this.bot.db.table("marriages").getAll(user.id, { index: "marriages" }).run();
    if (spouse) spouseid = spouse.id === user.id ? spouse.spouse : spouse.id;
    points.forEach(p => { if (p.guild === msg.channel.guild.id && p.receiver === user.id) pointcount++; });
    warnings.forEach(w => { if (w.guild === msg.channel.guild.id && w.receiver === user.id) warningcount++; });

    fields.push({
      name: "ID",
      value: user.id,
      inline: true,
    });

    fields.push({
      name: "Account",
      value: `Created on ${format.date(user.createdAt)} \n` + `Joined on ${format.date(user.joinedAt)}`,
    });

    if (playing) {
      fields.push({
        name: playingname,
        value: `${playing}`,
        inline: false,
      });
    }

    if (user.nick) {
      fields.push({
        name: "Nickname",
        value: `${user.nick}`,
        inline: true,
      });
    }

    if (user.roles.length) {
      fields.push({
        name: "Highest Role",
        value: `${user.highestRole.name}`,
        inline: true,
      });
    }

    fields.push({
      name: "Status",
      value: formatStatus(user.status),
      inline: true,
    });

    if (spouse) {
      fields.push({
        name: "Married To",
        value: `${spouseid ? this.bot.users.find(m => m.id === spouseid) ? this.bot.users.find(m => m.id === spouseid).username : `<@!${spouseid}>` : "Nobody"}`,
        inline: true,
      });
    }

    if (usercfg && usercfg.country) {
      fields.push({
        name: "Country",
        value: usercfg.country,
        inline: true,
      });
    }

    if (usercfg && usercfg.timezone) {
      fields.push({
        name: "Timezone",
        value: usercfg.timezone,
        inline: true,
      });
    }

    if (usercfg && usercfg.pronouns) {
      fields.push({
        name: "Pronouns",
        value: usercfg.pronouns,
        inline: true,
      });
    }

    if (cookies && cookies.amount > 0 || pointcount || warningcount) {
      fields.push({
        name: "Bot Stats",
        value: `${pointcount ? `${pointcount} point${pointcount === 1 ? "" : "s"}` : ""} \n` +
          `${warningcount ? `${warningcount} warning${warningcount === 1 ? "" : "s"} \n` : ""}` +
          `${cookies && cookies.amount > 0 ? `${cookies.amount} cookie${cookies.amount === 1 ? "" : "s"}` : ""}`,
        inline: false,
      });
    }

    msg.channel.createMessage({
      embed: {
        title: `👤 ${this.bot.tag(user.user)}`,
        description: usercfg && usercfg.bio ? usercfg.bio : null,
        color: this.bot.embed.color("general"),
        fields: fields,
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
