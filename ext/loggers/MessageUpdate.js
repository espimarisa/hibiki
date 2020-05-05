/*
  This logs when a message is deleted or updated.
*/

const Logging = require("../../lib/structures/Logging");
const format = require("../../lib/scripts/Format");

module.exports = (bot) => {
  // Logging database
  const loggingdb = new Logging(bot.db);
  const cansend = async (guild) => {
    if (!guild || !guild.channels) return;
    const canlog = await loggingdb.canLog(guild);
    if (!canlog) return;
    // Sets type
    const channel = await loggingdb.guildlogging(guild, "messageLogging");
    if (guild.channels.has(channel)) return channel;
  };

  // Logs when a message is deleted
  bot.on("messageDelete", async msg => {
    // Finds channel; returns if it shouldn't log
    const channel = await cansend(msg.channel.guild, "messageDelete");
    if (!channel || !msg || !msg.author || msg.author.id === bot.user.id) return;
    if (msg.content.length > 1024) msg.content.slice(768);
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.color("error"),
        author: {
          name: `${format.tag(msg.author, false)}'s message was deleted.`,
          icon_url: msg.author.avatarURL,
        },
        fields: [{
          name: "Content",
          value: msg.content || "No content",
          inline: false,
        }, {
          name: "Channel",
          value: msg.channel.mention || "No channel",
          inline: true,
        }, {
          name: "ID",
          value: msg.id,
          inline: true,
        }],
        image: {
          url: msg.attachments && msg.attachments[0] ? msg.attachments[0].proxy_url : null,
        },
      },
    }).catch(() => {});
  });

  // Logs when a message is updated
  bot.on("messageUpdate", async (msg, oldmsg) => {
    // Finds channel; returns if it shouldn't log
    const channel = await cansend(msg.channel.guild, "messageUpdate");
    if (!channel || !oldmsg || !msg.author || msg.author.id === bot.user.id) return;
    if (msg.content === oldmsg.content) return;
    if (msg.content.length > 1024) msg.content.slice(768);
    if (oldmsg.content.length > 1024) oldmsg.content.slice(768);
    bot.createMessage(channel, {
      embed: {
        color: bot.embed.color("error"),
        author: {
          name: `${format.tag(msg.author, false)}'s message was updated.`,
          icon_url: msg.author.avatarURL,
        },
        fields: [{
          name: "Old Content",
          value: oldmsg.content || "No content",
          inline: false,
        }, {
          name: "New Content",
          value: msg.content || "No content",
          inline: false,
        }, {
          name: "Channel",
          value: msg.channel.mention || "No channel",
          inline: true,
        }, {
          name: "Message",
          value: `[Jump](https://discord.com/channels/${msg.guild.id}/${msg.channel.id}/${msg.id})`,
          inline: true,
        }],
        image: {
          url: msg.attachments && msg.attachments[0] ? msg.attachments[0].proxy_url : null,
        },
      },
    }).catch(() => {});
  });
};
