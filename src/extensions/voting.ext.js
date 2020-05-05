/*
  This listens for proper requests from top.gg.
  It also adds cookies to the user's account who voted.
*/

const express = require("express");
const voting = require("../cfg").voting;

// Sets up express
const app = express();
app.use(express.json());
app.disable("x-powered-by");

module.exports = (bot) => {
  if (!voting.port) return;
  app.post("/voteReceive", async (req, res) => {
    // Sends if unauthorized
    if (req.headers.authorization !== voting.auth) {
      if (req.headers.authorization && req.headers.authorization.length || !req.headers.authorization) {
        bot.log.warn(`${req.connection.remoteAddress} tried to make a request with the wrong auth key.`);
        return res.sendStatus(403);
      }
    }

    // Gets the user from the request
    const user = bot.users.get(req.body.user);
    // Gets the user from the cookies DB
    let cookies = await bot.db.table("economy").get(req.body.user);

    // Inserts 0 if user doesn't exist
    if (!cookies) {
      cookies = { id: req.body.user, amount: 0, lastclaim: 9999 };
      await bot.db.table("economy").insert(cookies);
    }

    // Sets amount; if weekend give 200
    let amnt = cookies.amount + 150;
    if (req.body.isWeekend) amnt += 50;
    cookies = { id: req.body.user, amount: amnt, lastclaim: cookies.lastclaim };

    // Updates db
    await bot.db.table("economy").get(req.body.user).update(cookies);
    // Gets DM channel
    if (user) {
      const DMChannel = await user.getDMChannel();
      if (!DMChannel) return;
      DMChannel.createMessage({
        embed: {
          title: "✨ Thanks for voting!",
          description: `**${req.body.isWeekend ? "200" : "150"} cookies** have been added to your account.`,
          color: bot.embed.color("general"),
        },
      });
    }

    // Sends msg of who voted to logchannel
    bot.createMessage(bot.cfg.logchannel, {
      embed: {
        title: "🗳 User Voted",
        description: `**${user ? user.username : req.body.user}** has voted.`,
        color: bot.embed.color("general"),
      },
    });
    // Logs when a member voted
    bot.log.info(`${user ? user.username : req.body.user} has voted (requested from: ${req.connection.remoteAddress})`);
    res.sendStatus(200);
  });

  // Listens on port
  const listener = app.listen(voting.port, "0.0.0.0", () => bot.log.success(`Voting handler loaded on port ${listener.address().port}`));
};
