/**
 * @fileoverview Message pinboard
 * @description Posts messages reacted with the proper emoji to the pinboard
 * @module logger/messagePinboard
 */

module.exports = bot => {
  // When a pin is removed
  bot.on("messageReactionRemove", async (msg, emoji, uid) => {
      if (!msg.content) {
        try {
          msg = await msg.channel.getMessage(msg.id);
        } catch (err) {
          return;
        }
      }

      if (!msg) return;
      if (msg.author.bot) return;
      if (!msg.channel || !msg.channel.guild || !msg.channel.guild.id) return;

      // Gets guildconfig
      const guildconfig = await bot.db.table("guildconfig").get(msg.channel.guild.id).run();
      if (!guildconfig) return;
      const pin = guildconfig.pinEmoji ? guildconfig.pinEmoji : "📌";
      // Checks for pin reaction
      if (msg.reactions[pin] && msg.reactions[pin].count) {
        if (guildconfig.pinSelfPinning && msg.author.id === uid) return;
        if (!guildconfig) {
          return bot.db.table("guildconfig").insert({
            id: msg.channel.guild.id,
          }).run();
        }

        if (guildconfig && guildconfig.pinChannel && guildconfig.pinAmount) {
          // Looks for channel; gwets msgs
          const pinChannel = await msg.channel.guild.channels.get(guildconfig.pinChannel);
          if (!pinChannel) return;
          const getmsgs = await pinChannel.getMessages(50).catch(() => {});
          if (!getmsgs) return;
          // Finds pin msgs
          const pinmsg = getmsgs.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith(pin) && m.embeds[0].footer
            .text.endsWith(msg.id));
          if (msg.reactions[pin].count === 0) pin.delete().catch(() => {});
          if (parseInt(guildconfig.pinAmount) <= msg.reactions[pin].count) {
            // Edits the pinmsg
            if (pinmsg) {
              const embed = pinmsg.embeds[0];
              embed.footer.text = `${pin}${msg.reactions[pin].count} | ${msg.id}`;
              pinmsg.edit({ embed: embed });
            }
          }
        }
      } else {
        // Gets guildconfig
        const guildconfig = await bot.db.table("guildconfig").get(msg.channel.guild.id).run();
        if (!guildconfig) {
          return bot.db.table("guildconfig").insert({
            id: msg.channel.guild.id,
          }).run();
        }

        // Gets the pinChannel
        const pinChannel = await msg.channel.guild.channels.get(guildconfig.pinChannel);
        if (!pinChannel) return;
        const getmsgs = await pinChannel.getMessages(50);
        const pinmsg = getmsgs.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith(pin) && m.embeds[0].footer.text
          .endsWith(msg.id));
        if (!pinmsg) return;
        pinmsg.delete().catch(() => {});
      }
    })

    // When a pin is added
    .on("messageReactionAdd", async (msg, emoji, uid) => {
      let embedconstruct = {};
      if (!msg.content) {
        try {
          msg = await msg.channel.getMessage(msg.id);
        } catch (err) {
          return;
        }
      }

      if (!msg) return;
      if (msg.author.bot) return;
      const guildconfig = await bot.db.table("guildconfig").get(msg.channel.guild.id).run();
      if (!guildconfig) return;
      const pin = guildconfig.pinEmoji ? guildconfig.pinEmoji : "📌";
      // Checks for the pin reaction
      if (msg.reactions[pin] && msg.reactions[pin].count) {
        // Self-pinning check; checks channel & amount
        if (guildconfig.pinSelfPinning === false && msg.author.id === uid) return;
        if (guildconfig && guildconfig.pinChannel && guildconfig.pinAmount && parseInt(guildconfig.pinAmount) <= msg.reactions[pin].count) {
          // Looks for channel; gwets msgs
          const pinChannel = await msg.channel.guild.channels.get(guildconfig.pinChannel);
          if (!pinChannel) return;
          const getmsgs = await pinChannel.getMessages(50).catch(() => {});
          if (!getmsgs) return;
          // Finds pin msgs
          const pinmsg = getmsgs.find(m => m.embeds[0] && m.embeds[0].footer && m.embeds[0].footer.text.startsWith(pin) && m.embeds[0].footer
            .text.endsWith(msg.id) && m.author.id === bot.user.id);
          if (msg.reactions[pin].count === 0) pin.delete().catch(() => {});

          // Edits the pinmsg
          if (pinmsg) {
            const embed = pinmsg.embeds[0];
            embed.footer.text = `${pin}${msg.reactions[pin].count} | ${msg.id}`;
            return pinmsg.edit({ embed: embed });
          }

          // Sets the embed
          embedconstruct = {
            embed: {
              color: bot.embed.color("pinboard"),
              author: {
                name: bot.tag(msg.author),
                icon_url: msg.author.avatarURL,
              },
              fields: [{
                name: "Channel",
                value: msg.channel.mention,
                inline: true,
              }, {
                name: "Message",
                value: `[Jump](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`,
                inline: true,
              }],
              footer: {
                text: `${pin}${msg.reactions[pin].count} | ${msg.id}`,
              },
            },
          };

          // Attempts to remove image URLs from the embed
          if (msg.content) embedconstruct.embed.description = msg.content || "No content";
          const urlcheck = msg.content.match(
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/);
          if (urlcheck || msg.attachments[0]) {
            let img;
            if (urlcheck && (urlcheck[0].endsWith(".jpg") || urlcheck[0].endsWith(".png") || urlcheck[0].endsWith(".gif"))) img = urlcheck[0];
            if (msg.attachments && msg.attachments[0]) img = msg.attachments[0].proxy_url;
            // Sets the image
            embedconstruct.embed.image = {
              url: img,
            };
          }

          bot.createMessage(guildconfig.pinChannel, embedconstruct).catch(() => {});
        }
      }
    });
};
