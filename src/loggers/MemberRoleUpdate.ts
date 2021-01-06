/**
 * @file MemberRoleUpdate Logger
 * @description Logs when a member is given a role through the bot
 * @module logger/MemberRoleUpdate
 */

import type { Guild, Role, User } from "eris";
import { Logger } from "../classes/Logger";
import { convertHex } from "../helpers/embed";
const TYPE = "modLogging";

export class MemberRoleUpdate extends Logger {
  events = ["memberVerify", "memberUnverify", "roleAssign", "roleUnassign"];

  async run(event: string, guild: Guild, member: User, giver?: User, reason?: string[], role?: Role) {
    /**
     * Logs when a member is verified
     */

    if (event === "memberVerify") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: `${this.tagUser(giver)} verified ${this.tagUser(member)}`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Reason",
              value: `${reason}`,
              inline: false,
            },
          ],
        },
      });
    }

    /**
     * Logs when a member is unverified
     */

    if (event === "memberUnverify") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("error"),
          author: {
            name: `${this.tagUser(giver)} unverified ${this.tagUser(member)}`,
            icon_url: member.dynamicAvatarURL(),
          },
          fields: [
            {
              name: "Reason",
              value: `${reason}`,
              inline: false,
            },
          ],
        },
      });
    }

    /**
     * Logs when a member assigns a role
     */

    if (event === "roleAssign") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: `${this.tagUser(member)} self-assigned the ${role.name} role.`,
            icon_url: member.dynamicAvatarURL(),
          },
        },
      });
    }

    /**
     * Logs when a member unassigns a role
     */

    if (event === "roleUnassign") {
      const channel = await this.getChannel(guild, TYPE, event);
      if (!channel) return;

      this.bot.createMessage(channel, {
        embed: {
          color: convertHex("general"),
          author: {
            name: `${this.tagUser(member)} unassigned the ${role.name} role.`,
            icon_url: member.dynamicAvatarURL(),
          },
        },
      });
    }
  }
}
