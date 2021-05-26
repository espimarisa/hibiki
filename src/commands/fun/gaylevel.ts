/**
 * @file GayLevel command
 * @description Calculates how gay executor or another member is
 */

import type { Member, Message, TextChannel } from "eris";

import { Command } from "../../classes/Command";

/* eslint-disable no-inline-comments */
const GAY_LEVEL_EASTER_EGG = {
  "647269760782041133": "gayest lesbian ever", // espi hackig! Jik
  "569490086547292160": "♾️%", // maya hackig! Jik
  "686166148882104337": "(FBI still searching)", // lambdagg skid! Jik
  "195090852974952448": "🇫🇷%", // Nocturno romanian guy! Jik
  "451285730648653834": "(b=13, a=10 ∫2xdx)%", // Zorbit maths expert! Jik
};

export class GaylevelCommand extends Command {
  description = "Calculates how gay you or another member is.";
  args = "[member:member&fallback]";
  aliases = ["gay", "gayness"];

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    const member = pargs[0].value as Member;

    msg.createEmbed(
      `🏳️‍🌈 ${msg.string("fun.GAYLEVEL")}`,
      msg.string("fun.GAYLEVEL_LEVEL", {
        member: member.user.username,
        level:
          GAY_LEVEL_EASTER_EGG[member.id] ||
          ((await this.bot.db.getUserConfig(member.id))?.gayLevel || Math.round(Math.random() * 100)) + "%",
      }),
    );
  }
}
