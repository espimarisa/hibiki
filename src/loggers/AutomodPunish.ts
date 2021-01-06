/**
 * @file AutomodPunish Logger
 * @description Logs when a member is punished through Automod
 * @module logger/AutomodPunish
 */

import type { Guild, Message, User } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
const TYPE = "modLogging";

export class AutomodPunish extends Logger {
  events = ["automodMemberMute", "automodAntiInvite"];

  async run(event: string, guild: Guild, member: User, warning: string, messages: any) {
    /**
     * Logs when a member is muted by automod
     */

    if (event === "automodMemberMute") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: `${this.tagUser(member)} was automatically muted by Automod.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Cause of Mute",
              value: `${
                messages ? messages.map((m: Message) => `**${member.username}:** ${m.content.substring(0, 128)}`).join("\n") : "Auto punish"
              }`,
              inline: false,
            },
          ],
        },
      });
    }

    /**
     * Logs when AntiInvite catches an invite
     */

    if (event === "automodAntiInvite") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;
      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: `${this.tagUser(member)} sent an invite.`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Content",
              value: messages.length > 100 ? `${messages.substring(0, 100)}..` : messages || "No content",
              inline: false,
            },
            {
              name: "Warning ID",
              value: warning ? warning : "Not warned",
              inline: false,
            },
          ],
        },
      });
    }
  }
}
