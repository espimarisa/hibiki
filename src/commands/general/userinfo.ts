import type { Dayjs } from "dayjs";
import type { EmbedField, Member, Message, Role, TextChannel } from "eris";
import { Constants } from "eris";
import { User } from "eris";
import { Command } from "../../classes/Command";
import { defaultAvatar } from "../../helpers/constants";
import { dateFormat, statusFormat, statusTypeFormat } from "../../utils/format";
import { getRESTUser } from "../../utils/getRESTUser";
import dayjs from "dayjs";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);
dayjs.extend(timezone);

export class UserinfoCommand extends Command {
  description = "Returns information about a member and displays their profile.";
  args = "<member:member&fallback,userFallback>";
  aliases = ["profileinfo", "member", "minfo", "memberinfo", "uinfo", "user"];
  allowdisable = false;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[]) {
    let member = (await pargs[0].value) as Member;
    if (!member?.id) member = msg.member;

    // Checks to see if a user is incomplete
    const user = member instanceof User;
    let fallbackAvatar: string;
    let fallbackTag: string;

    // Database queries
    const userconfig = await this.bot.db.getUserConfig(member.id);
    const cookies = await this.bot.db.getUserCookies(member.id);
    const points = await this.bot.db.getAllUserGuildPoints(member.id, msg.channel.guild.id);
    const warnings = await this.bot.db.getAllUserGuildWarnings(member.id, msg.channel.guild.id);
    const [marriage] = await this.bot.db.getUserMarriage(member.id);

    // Incomplete user fallback data
    if (user) {
      if (!member.avatar) fallbackAvatar = `https://cdn.discordapp.com/embed/avatars/${parseInt(member.discriminator) % 5}.png`;
      else fallbackAvatar = `https://cdn.discordapp.com/avatars/${member.id}/${member.avatar}.png?size=512`;
      fallbackTag = `${member.username}#${member.discriminator}`;
    }

    // Localizes pronouns
    const pronouns = [
      msg.string("global.NO_PREFERENCE"),
      msg.string("global.PRONOUNS_HE"),
      msg.string("global.PRONOUNS_SHE"),
      msg.string("global.PRONOUNS_THEY"),
    ];

    // Gets user's current time
    let timezone: Dayjs | string;
    if (userconfig?.timezone && !userconfig?.timezoneHide) {
      const currentTime = new Date();
      if (userconfig.timezone) timezone = dayjs(currentTime).tz(userconfig.timezone);
      if (!timezone || !(timezone as any).$d) timezone = null;
      else timezone = dateFormat((timezone as any).$d, msg.string);
    }

    // Custom statuses/game
    let statusType: string | number;
    let playing: string;
    if (member.game) {
      playing = member.game.name.trim() ?? "";

      // Custom status type ID
      if (member.game.type === 4) {
        if (member.game.emoji?.name && !member.game.emoji?.id) {
          playing = `${member.game.emoji.name} ${member.game.state || ""}`;
        } else {
          playing = member.game.state;
        }
      }
    }

    // Spotify & playing
    if (member.activities?.length) {
      const song = member.activities.find((s) => s.id === "spotify:1");
      const game = member.activities.find((s) => s.id !== "custom");
      if (song) {
        playing = msg.string("general.USER_SPOTIFY", { name: song.details, artist: song.state, album: song.assets?.large_text });
        statusType = statusTypeFormat(msg.string, member.game.type, true);
      } else if (game && !song) {
        playing = `${game.name}`;
        statusType = statusTypeFormat(msg.string, game.type);
      }
    }

    // Custom badges (if running on production)
    let badges = "";
    const flags = member?.user?.publicFlags || ((member as any) as User).publicFlags;
    Object.keys(Constants.UserFlags).forEach((flag) => {
      if (this.bot.config.customEmojis?.[flag]?.length && flags & Constants.UserFlags[flag]) badges += this.bot.config.customEmojis[flag];
    });

    if (this.bot.config.customEmojis?.jiktim && this.bot.config.customEmojis?.jiktimID) {
      const jikGuild = this.bot.guilds.get(this.bot.config.customEmojis?.jiktimID);
      if (jikGuild) {
        const isJikMember = jikGuild.members?.get(member.id);
        if (isJikMember) badges += this.bot.config.customEmojis?.jiktim;
      }
    }

    // Embed fields
    const fields: EmbedField[] = [];
    const botStats: EmbedField[] = [];

    // Cookie amount
    if (cookies?.amount > 0) {
      botStats.push({
        name: msg.string("fun.COOKIE_TOTAL", { amount: cookies.amount }),
        value: `${cookies?.amount}`,
      });
    }

    // Member points
    if (points?.length > 0) {
      botStats.push({
        name: msg.string("fun.POINT_TOTAL", { amount: points.length }),
        value: `${points.length}`,
      });
    }

    // Member warnings
    if (warnings?.length > 0) {
      botStats.push({
        name: msg.string("moderation.WARNING_TOTAL", { amount: warnings.length }),
        value: `${warnings.length}`,
      });
    }

    // User ID
    fields.push({
      name: msg.string("global.ID"),
      value: member.id,
    });

    // Account creation & join dates
    fields.push({
      name: msg.string("general.USER_ACCOUNT"),
      value:
        `${msg.string("general.USER_CREATED")} ${dateFormat(member.createdAt, msg.string)}` +
        (!user ? `\n${msg.string("general.USER_JOINED")} ${dateFormat(member.joinedAt, msg.string)}` : ""),
    });

    // Playing
    if (member.status !== undefined) {
      fields.push({
        name: msg.string("global.STATUS"),
        value: `${statusFormat(msg.string, member.status)}`,
        inline: false,
      });
    }

    // Playing
    if (playing && statusType) {
      fields.push({
        name: `${statusType}`,
        value: `${playing}`,
        inline: true,
      });
    }

    // Nicknames
    if (member.nick) {
      fields.push({
        name: msg.string("global.NICKNAME"),
        value: `${member.nick}`,
        inline: true,
      });
    }

    // Highest role
    if (member.roles?.length) {
      let role: Role;
      member.roles.forEach((r) => {
        const roles = msg.channel.guild?.roles?.get(r);
        if (!role) role = roles;
        if (role.position < roles.position) role = roles;
      });

      if (role) {
        fields.push({
          name: "Highest role",
          value: `${role.name}`,
          inline: true,
        });
      }
    }

    // Userconfig data
    if (userconfig) {
      if (userconfig.pronouns) {
        fields.push({
          name: msg.string("global.PRONOUNS"),
          value: `${pronouns[userconfig.pronouns]}`,
          inline: true,
        });
      }

      // Current time
      if (timezone) {
        fields.push({
          name: msg.string("general.USER_TIME"),
          value: `${timezone}`,
          inline: true,
        });
      }

      // Timezone
      if (userconfig.timezone && !userconfig.timezoneHide) {
        fields.push({
          name: msg.string("global.TIMEZONE"),
          value: `${userconfig.timezone}`,
          inline: true,
        });
      }
    }

    // Spouse
    if (marriage) {
      // Tries to get the spouse name or mention
      const spouse = marriage.id === member.id ? marriage.spouse : marriage.id;
      const spouseMember = msg.channel.guild.members.get(spouse);
      let spouseUser = this.bot.users.get(spouse);
      if (!spouseMember && !spouseUser) spouseUser = await getRESTUser(spouse, this.bot);
      const marriedTo = spouse ? (spouseMember ? `<@!${spouse}>` : spouseUser?.username ?? `<@!${spouse}>`) : spouse ?? null;

      if (marriedTo) {
        fields.push({
          name: msg.string("general.USER_MARRIEDTO"),
          value: `${marriedTo}`,
          inline: true,
        });
      }
    }

    // Bot stats
    if (botStats.length) {
      fields.push({
        name: msg.string("general.USER_BOTSTATS"),
        value: `${botStats.map((s) => `${s.value} ${s.name}`).join("\n")}`,
        inline: false,
      });
    }

    // Sends userinfo embed
    msg.channel.createMessage({
      embed: {
        description: `${badges.length ? `${badges}\n` : ""}${userconfig?.bio ?? ""}`,
        color: msg.convertHex("general"),
        fields: fields,
        author: {
          icon_url: fallbackAvatar ?? (member.user.dynamicAvatarURL() || defaultAvatar),
          name: `${fallbackTag ?? msg.tagUser(member.user)}`,
        },
        thumbnail: {
          url: fallbackAvatar ?? (member.user.dynamicAvatarURL() || defaultAvatar),
        },
        footer: {
          text: msg.string("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            extra: user ? msg.string("general.USER_NOTINGUILD") : undefined,
          }),
          icon_url: msg.author.dynamicAvatarURL() || defaultAvatar,
        },
      },
    });
  }
}
