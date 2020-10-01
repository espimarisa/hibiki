/**
 * @fileoverview Voting webserver
 * @description Listens for votes on top.gg and gives voters cookies
 * @module webserver/voting
 */

const express = require("express");
const config = require("../../config").voting;
const docker = require("../utils/docker");

// Sets up express
const app = express();
app.use(express.json());
app.use(require("helmet")());

module.exports = bot => {
  if (!config || !config.port || !config.auth) return;
  app.post("/voteReceive", async (req, res) => {
    // Sends if unauthorized
    if (req.headers.authorization !== config.auth) {
      if (req.headers.authorization && req.headers.authorization.length || !req.headers.authorization) {
        bot.log.warn(`${req.connection.remoteAddress} tried to make a request with the wrong auth key.`);
        return res.sendStatus(401);
      }
    }

    // Gets info from the request
    const user = bot.users.get(req.body.user);
    let cookies = await bot.db.table("economy").get(req.body.user).run();

    if (!cookies) {
      cookies = { id: req.body.user, amount: 0, lastclaim: 9999 };
      await bot.db.table("economy").insert(cookies).run();
    }

    // Sets amount; if weekend give 300
    let amnt = cookies.amount + 150;
    if (req.body.isWeekend) amnt += 150;
    cookies = { id: req.body.user, amount: amnt, lastclaim: cookies.lastclaim };

    // Updates db
    await bot.db.table("economy").get(req.body.user).update(cookies).run();

    // DMs the voter
    if (user) {
      const DMChannel = await user.getDMChannel();
      if (!DMChannel) return;
      DMChannel.createMessage({
        embed: {
          title: "✨ Thanks for voting!",
          description: `**${req.body.isWeekend ? "300" : "150"} cookies** have been added to your account.`,
          color: bot.embed.color("general"),
        },
      }).catch(() => {});
    }

    // Sends msg of who voted
    bot.createMessage(bot.config.logchannel, {
      embed: {
        title: "🗳 User Voted",
        description: `**${user ? user.username : req.body.user}** has voted.`,
        color: bot.embed.color("general"),
      },
    });

    // Logs when a user votes
    bot.log.info(`${user ? user.username : req.body.user} has voted (requested from: ${req.connection.remoteAddress})`);
    res.sendStatus(200);
  });

  // Listens on port
  app.listen(docker ? 7013 : config.port, "0.0.0.0");
  bot.log.info(`Voting handler listening on port ${config.port}`);
};
