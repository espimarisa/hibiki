/**
 * @file Voting webserver
 * @description Webserver for voting rewards
 * @module webserver/voting
 */

import type { HibikiClient } from "../classes/Client";
import { convertHex } from "../helpers/embed";
import express from "express";
import config from "../../config.json";

const app = express();
app.use(express.json());

export async function startVoting(bot: HibikiClient) {
  if (!config.keys.botlists.voting.auth || !config.keys.botlists.voting.port) return;

  app.post("/voteReceive", async (req, res) => {
    // Sends if unauthorized
    if (req.headers.authorization !== config.keys.botlists.voting.auth) {
      if (req.headers.authorization?.length || !req.headers.authorization) {
        bot.log.warn(`${req.socket.remoteAddress} tried to make a request with the wrong auth key.`);
        return res.sendStatus(401);
      }
    }

    // Gets info from the request
    const user = bot.users.get(req.body.user);
    let cookies = await bot.db.getUserCookies(req.body.user);

    if (!cookies) {
      await bot.db.insertBlankUserCookies(req.body.user);
      cookies = { id: req.body.user, amount: 0, lastclaim: null };
    }

    // Sets amount; if weekend give 300
    let amnt = cookies.amount + 150;
    if (req.body.isWeekend) amnt += 150;
    cookies = { id: req.body.user, amount: amnt, lastclaim: cookies.lastclaim };

    // Updates db
    await bot.db.updateUserCookies(req.body.user, cookies);

    // DMs the voter
    if (user) {
      const dmChannel = await user.getDMChannel();
      if (!dmChannel) return;
      dmChannel
        .createMessage({
          embed: {
            // TODO: Localise
            title: "✨ Thanks for voting!",
            description: `**${req.body.isWeekend ? "300" : "150"} cookies** have been added to your account.`,
            color: convertHex("general"),
          },
        })
        .catch(() => {});
    }

    // Sends msg of who voted
    bot.createMessage(config.logchannel, {
      embed: {
        title: "🗳 User Voted",
        description: `**${user ? user.username : req.body.user}** has voted.`,
        color: convertHex("general"),
      },
    });

    // Logs when a user votes
    bot.log.info(`${user ? user.username : req.body.user} has voted.`);
    res.sendStatus(200);
  });

  // Listens on port
  app.listen(config.keys.botlists.voting.port, "0.0.0.0");
  bot.log.info(`Voting handler listening on port ${config.keys.botlists.voting.port}`);
}
