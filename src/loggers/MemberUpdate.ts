/**
 * @file MemberUpdate Logger
 * @description Logs when a member joins or leaves a guild
 * @module logger/MemberUpdate
 */

import type { EmbedOptions, Guild, Invite, Member, TextChannel } from "eris";
import { Logger } from "../classes/Logger";
import { defaultAvatar } from "../helpers/constants";
import { dateFormat } from "../utils/format";
const TYPE = "memberLogging";

export class MemberUpdate extends Logger {
  events = ["guildMemberAdd", "guildMemberRemove", "loggingMemberAdd", "loggingMemberRemove"];

  async run(event: string, guild: Guild, member: Member) {
    // Compares current guild invites and cached invites
    function compareInvites(current: Invite[], saved: Invite[]) {
      for (let i = 0; i < current?.length; i++) {
        if (current[i] && saved[i] && current[i]?.uses > saved[i]?.uses) return current[i];
      }

      return null;
    }

    switch (event) {
      /**
       * Logs to the leavejoin channel when a member joins
       */

      case "guildMemberAdd": {
        if (!member) return;

        // Emits the loggingMember event
        this.bot.emit("loggingMemberAdd", guild, member);

        // Gets the leavejoin channel
        const guildconfig = await this.bot.db.getGuildConfig(guild.id);
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        // Re-adds any muted roles if the member tried to evade mute
        const muted = await this.bot.db.getGuildMuteCache(guild.id);
        const mute = muted.find((m: MuteCache) => m.member === member.id && m.guild === guild.id);
        if (mute && guildconfig?.mutedRole)
          await member.addRole(guildconfig.mutedRole, string("logger.JOINED_AFTER_MUTED")).catch(() => {});
        if (!guildconfig?.leaveJoin) return;
        const leavejoinchannel = guild.channels.find((c) => c.id === guildconfig?.leaveJoin) as TextChannel;
        if (!leavejoinchannel) return;

        // Default fields
        let joinMessage = string("logger.JOIN_MESSAGE", { guild: guild.name, member: member.user.username });
        let joinTitle = `🎉 ${string("logger.NEW_MEMBER")}`;
        let greetingFooter = string("logger.MEMBER_COUNT", { guild: guild.name, members: guild.memberCount });

        // Sets the joinMessage
        if (guildconfig?.joinMessage && guildconfig?.joinMessage?.length < 256) {
          joinMessage = guildconfig.joinMessage;
          // TODO: Use a switch case? Isn't replace... slow? This is shit code!!!! @resolvedxd what do?
          joinMessage = joinMessage.replace("{member}", `**${member.user.username}**`);
          joinMessage = joinMessage.replace("{membercount}", `**${guild.memberCount}**`);
          joinMessage = joinMessage.replace("{servername}", `**${guild.name}**`);
        }

        // Sets the joinTitle
        if (guildconfig?.joinTitle && guildconfig?.joinTitle?.length < 100) {
          joinTitle = guildconfig.joinTitle;
          joinTitle = joinTitle.replace("{member}", `${member.user.username}`);
          joinTitle = joinTitle.replace("{membercount}", `${guild.memberCount}`);
          joinTitle = joinTitle.replace("{servername}", `${guild.name}`);
        }

        // Sets the greetingFooter
        if (guildconfig?.greetingFooter && guildconfig?.greetingFooter?.length < 64) {
          greetingFooter = guildconfig.greetingFooter;
          greetingFooter = greetingFooter.replace("{member}", `${member.user.username}`);
          greetingFooter = greetingFooter.replace("{membercount}", `${guild.memberCount}`);
          greetingFooter = greetingFooter.replace("{servername}", `${guild.name}`);
        }

        // Sends when a member joined
        this.bot.createMessage(leavejoinchannel.id, {
          embed: {
            title: joinTitle,
            description: joinMessage,
            color: this.convertHex("success"),
            footer: {
              text: greetingFooter,
              icon_url: this.bot.user.dynamicAvatarURL(),
            },
          },
        });

        break;
      }

      /**
       * Logs to the leavejoin channel when a member leaves
       */

      case "guildMemberRemove": {
        if (!member) return;

        // Emits the loggingMember event
        this.bot.emit("loggingMemberRemove", guild, member);

        // Gets the leavejoin channel
        const guildconfig = await this.bot.db.getGuildConfig(guild.id);
        if (!guildconfig?.leaveJoin) return;
        const leavejoinchannel = guild.channels.find((c) => c.id === guildconfig?.leaveJoin) as TextChannel;
        if (!leavejoinchannel) return;
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        // Sets default fields
        let leaveMessage = string("logger.LEAVE_MESSAGE", { member: member.user.username });
        let leaveTitle = `👋 ${string("logger.MEMBER_LEFT")} `;
        let greetingFooter = string("logger.MEMBER_COUNT", { guild: guild.name, members: guild.memberCount });

        // Sets the leaveMessage
        if (guildconfig?.leaveMessage && guildconfig?.leaveMessage?.length < 256) {
          leaveMessage = guildconfig.leaveMessage;
          // TODO: Read above TODO. Shit code.
          leaveMessage = leaveMessage.replace("{member}", `**${member.user.username}**`);
          leaveMessage = leaveMessage.replace("{membercount}", `**${guild.memberCount}**`);
          leaveMessage = leaveMessage.replace("{servername}", `**${guild.name}**`);
        }

        // Sets the leaveTitle
        if (guildconfig?.leaveTitle && guildconfig?.leaveTitle?.length < 100) {
          leaveTitle = guildconfig.leaveTitle;
          leaveTitle = leaveTitle.replace("{member}", `**${member.user.username}**`);
          leaveTitle = leaveTitle.replace("{membercount}", `**${guild.memberCount}**`);
          leaveTitle = leaveTitle.replace("{servername}", `**${guild.name}**`);
        }

        // Sets the greetingFooter
        if (guildconfig?.greetingFooter && guildconfig?.greetingFooter?.length < 64) {
          greetingFooter = guildconfig.greetingFooter;
          greetingFooter = greetingFooter.replace("{member}", `${member.user.username}`);
          greetingFooter = greetingFooter.replace("{membercount}", `${guild.memberCount}`);
          greetingFooter = greetingFooter.replace("{servername}", `${guild.name}`);
        }

        // Sends when a member leaves
        this.bot.createMessage(leavejoinchannel.id, {
          embed: {
            title: leaveTitle,
            description: leaveMessage,
            color: this.convertHex("error"),
            footer: {
              text: greetingFooter,
              icon_url: this.bot.user.dynamicAvatarURL(),
            },
          },
        });

        break;
      }

      /**
       * Logs to the loggingMember channel when a member joins
       */

      case "loggingMemberAdd": {
        const guildconfig = await this.bot.db.getGuildConfig(guild.id);
        const channel = await this.getChannel(guild, TYPE, event, guildconfig);
        if (!channel) return;
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        // Main embed
        const embed = {
          color: this.convertHex("success"),
          fields: [
            {
              name: string("global.ID"),
              value: member.id,
              inline: false,
            },
            {
              name: string("global.CREATED"),
              value: dateFormat(member.user.createdAt, string),
              inline: true,
            },
            {
              name: string("global.ACCOUNT_AGE"),
              value: `**${Math.floor((Date.now() - member.user.createdAt) / 86400000)}** ${string("global.DAYS_OLD")}`,
              inline: true,
            },
          ],
          author: {
            name: `${this.tagUser(member.user)} ${string("global.JOINED")}`,
            icon_url: member.user.dynamicAvatarURL(),
          },
          thumbnail: {
            url: member.user ? member.user.dynamicAvatarURL(null, 1024) : defaultAvatar,
          },
          footer: {
            icon_url: guild.iconURL || defaultAvatar,
            text: string("logger.MEMBER_COUNT", { guild: guild.name, members: guild.memberCount }),
          },
        } as EmbedOptions;

        // Join date
        if (member.joinedAt) {
          embed.fields.push({
            name: string("global.JOINED_ON"),
            value: dateFormat(member.joinedAt, string),
            inline: true,
          });
        }

        setTimeout(async () => {
          if (this.bot.config.inviteLogs && guildconfig?.inviteOptOut !== true) {
            const guildInvites = await guild.getInvites().catch(() => {});
            const cachedInvites = this.bot.inviteHandler.inviteCache[guild.id];

            if (guildInvites && cachedInvites) {
              // Finds the invite
              const invite = compareInvites(guildInvites, cachedInvites);

              if (!invite) {
                if (guild.features.includes("VANITY_URL")) {
                  embed.fields.push({
                    name: string("logger.INVITE_USED"),
                    value: string("general.SERVER_FEATURE_VANITY"),
                    inline: true,
                  });
                }
              }

              // Invite code
              if (invite) {
                embed.fields.push({
                  name: string("logger.INVITE_USED"),
                  value: `${member.bot ? string("logger.INVITE_OAUTH") : invite.code || string("global.UNKNOWN")}`,
                  inline: true,
                });

                // Uses & max uses
                if (invite.uses) {
                  embed.fields.push({
                    name: string("logger.INVITE_USES"),
                    // TODO: Add max age with dateParse()
                    value: `${invite.maxUses ? `${invite.uses}/${invite.maxUses}` : invite.uses}`,
                    inline: true,
                  });
                }

                // Invite channel
                if (invite.channel) {
                  embed.fields.push({
                    name: string("global.CHANNEL"),
                    value: guild.channels.get(invite.channel.id) ? guild.channels.get(invite.channel.id).mention : invite.channel.name,
                    inline: true,
                  });
                }

                // Inviter
                if (invite.inviter) {
                  embed.fields.push({
                    name: string("utility.INVITER"),
                    value: `${this.tagUser(invite.inviter)} (${invite.inviter.id})`,
                    inline: false,
                  });
                }
              }

              // Caches the new invites
              this.bot.inviteHandler.inviteCache[guild.id] = guildInvites;
            }
          }

          this.bot.createMessage(channel, { embed: embed });
        }, 5000);

        break;
      }

      /**
       * Logs to the loggingMember channel when a member leaves
       */

      case "loggingMemberRemove": {
        const guildconfig = await this.bot.db.getGuildConfig(guild.id);
        const channel = await this.getChannel(guild, TYPE, event, guildconfig);
        if (!channel) return;
        const string = this.bot.localeSystem.getLocaleFunction(
          guildconfig?.guildLocale ? guildconfig?.guildLocale : this.bot.config.defaultLocale,
        );

        const embed = {
          color: this.convertHex("error"),
          author: {
            name: `${this.tagUser(member.user)} ${string("global.LEFT")}`,
            icon_url: member.user.dynamicAvatarURL(),
          },
          thumbnail: {
            url: member.user ? member.user.dynamicAvatarURL(null, 1024) : defaultAvatar,
          },
          fields: [
            {
              name: string("global.ID"),
              value: member.id,
            },
            {
              name: string("global.CREATED_AT"),
              value: dateFormat(member.user.createdAt, string),
            },
            {
              name: string("global.ACCOUNT_AGE"),
              value: `**${Math.floor((Date.now() - member.user.createdAt) / 86400000)}** ${string("global.DAYS_OLD")}`,
            },
          ],
          footer: {
            icon_url: guild.iconURL || defaultAvatar,
            text: string("logger.MEMBER_COUNT", { guild: guild.name, members: guild.memberCount }),
          },
        };

        // Join date
        if (member.joinedAt) {
          embed.fields.push({
            name: string("global.JOINED_ON"),
            value: dateFormat(member.joinedAt, string),
          });
        }

        await this.bot.createMessage(channel, { embed: embed });

        break;
      }
    }
  }
}
