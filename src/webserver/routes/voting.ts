/**
 * @file Voting routes
 * @description Routings for voting and votingRewards
 * @module webserver/routes/voting
 */

import type { HibikiClient } from "../../classes/Client";
import { convertHex } from "../../helpers/embed";
import express from "express";
import rateLimit from "express-rate-limit";
const router = express.Router();

const votingRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: "Too many voting requests in a short period of time.",
});

export function votingRoutes(bot: HibikiClient) {
  router.post("/get/", votingRateLimit, async (req, res) => {
    if (req.headers.authorization !== bot.config.keys.botlists.voting.auth) {
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
    let amount = cookies.amount + 150;
    if (req.body.isWeekend) amount += 150;
    cookies = { id: req.body.user, amount: amount, lastclaim: cookies.lastclaim };

    // Updates db
    await bot.db.updateUserCookies(req.body.user, cookies);

    // DMs the voter
    if (user) {
      const dmChannel = await user.getDMChannel().catch(() => {});
      if (!dmChannel) return;

      // Gets the user's locale
      const userLocale = await bot.localeSystem.getUserLocale(`${user}`, bot);
      const string = bot.localeSystem.getLocaleFunction(userLocale);

      await dmChannel
        .createMessage({
          embed: {
            title: `✨ ${string("global.THANKS_FOR_VOTING")}`,
            description: string("global.VOTING_COOKIES_ADDED", { amount: req.body.isWeekend ? "300" : "150" }),
            color: convertHex("general"),
          },
        })
        .catch(() => {});
    }

    // Sends msg of who voted
    await bot.createMessage(bot.config.logchannel, {
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

  return router;
}
