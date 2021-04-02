/**
 * @file Ask
 * @description Asks for a user's input and validates it
 * @module utils/ask
 */

import type { HibikiClient } from "../classes/Client";
import type { Emoji, Member, Message, TextChannel } from "eris";
import type { ResponseData } from "../typings/utils";
import type { LocaleString } from "../typings/locales";
import { defaultEmojiRegex, emojiIDRegex, fullInviteRegex } from "./constants";
import { localizeSetupItems } from "./format";
import { timeoutHandler, waitFor } from "./waitFor";

// Dayjs plugins
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

const localeEmojis = {};
const localeNames = {};
const cmdCategories: string[] = [];
const blacklistedCategories = ["general", "owner"];

// Asks a user for yes or no response
export async function askYesNo(bot: HibikiClient, string: LocaleString, member: string, channel: string) {
  let response: ResponseData = { msg: null, response: null };
  const no = string("global.NO").toLowerCase();
  const yes = string("global.YES").toLowerCase();
  const sameStartingChar = no[0] === yes[0];

  await waitFor(
    "messageCreate",
    15000,
    (m: Message) => {
      if (!m.content) return false;
      if (m.author.id !== member) return false;
      if (m.channel?.id !== channel) return false;

      // If two locales start with the same y/n chars
      if (sameStartingChar) {
        if (m.content.toLowerCase() === no) {
          response = { msg: m, response: false };
          return true;
        } else if (m.content.toLowerCase() === yes) {
          response = { msg: m, response: true };
          return true;
        }
      } else if (m.content.toLowerCase().startsWith(no[0]) || m.content.toLowerCase() === "no") {
        response = { msg: m, response: false };
        return true;
      } else if (m.content.toLowerCase().startsWith(yes[0]) || m.content.toLowerCase() === "yes") {
        response = { msg: m, response: true };
        return true;
      }
    },

    bot,
  );

  return response;
}

// Asks for a specific type of input
export function askFor(bot: HibikiClient, msg: Message<TextChannel>, type: ValidItemTypes, arg: any) {
  if (!type) return "No type";
  if (!arg) return "No arg";
  if (!msg.channel.guild) return "No guild";
  const clear = arg.toLowerCase() === "clear" || arg.toLowerCase() === "off" || arg.toLowerCase() === "null";
  if (clear) return "clear";

  switch (type) {
    // Roles
    case "role": {
      const role = bot.args.argtypes.role(arg, msg, undefined);
      if (!role || role?.managed) return "No role";
      return role.id;
    }

    // Channels
    case "channel": {
      const channel = bot.args.argtypes.channel(arg, msg, undefined);
      if (!channel) return;
      return channel.id;
    }

    // Voice channels
    case "voiceChannel": {
      const channel = bot.args.argtypes.voiceChannel(arg, msg, undefined);
      if (channel.type !== 2) return "Invalid channel type";
      if (!channel) return;
      return channel.id;
    }

    // Numbers
    case "number": {
      const number = bot.args.argtypes.number(arg, msg);
      if (!number) return "No number";
      return number;
    }

    // Strings
    case "string": {
      let string = bot.args.argtypes.string(arg);
      if (!string) return "No string";
      string = string.replace(emojiIDRegex, "");
      return string;
    }

    // Booleans
    case "boolean": {
      const boolean = bot.args.argtypes.boolean(arg, undefined, arg);
      if (!boolean) return "No boolean";
      return boolean;
    }

    // Role arrays
    case "roleArray": {
      const roles = bot.args.argtypes.roleArray(arg.split(/(?:\s{0,},\s{0,})|\s/), msg);
      if (!roles?.length) return "No rolearray";
      return roles;
    }

    // Channel arrays
    case "channelArray": {
      const channels = bot.args.argtypes.channelArray(arg.split(/(?:\s{0,},\s{0,})|\s/), msg);
      if (!channels?.length) return "No channelArray";
      return channels;
    }

    // Emoji
    case "emoji": {
      const emoji = defaultEmojiRegex.exec(arg);
      if (!emoji) return "No emoji";
      return emoji[0];
    }

    // Timezones
    case "timezone": {
      let invalidTimezone = false;
      try {
        dayjs(new Date()).tz(arg);
      } catch (err) {
        invalidTimezone = true;
      }

      if (invalidTimezone) return "No valid timezone";
      return arg;
    }

    // Disabled commands
    case "disabledCmds": {
      const cmds = arg
        .split(/(?:\s{0,},\s{0,})|\s/)
        .map(
          (cmd: string) =>
            bot.commands.find((c) => {
              return c.allowdisable && (c.name === cmd || c.aliases.includes(cmd));
            })?.name,
        )
        .filter((c: string) => c !== undefined);

      return cmds.length ? cmds : "No cmds";
    }

    // Disabled categories
    case "disabledCategories": {
      if (!cmdCategories.length)
        bot.commands.forEach((cmd) => {
          if (!cmdCategories.includes(cmd.category) && !blacklistedCategories.includes(cmd.category)) cmdCategories.push(cmd.category);
        });

      const cats = arg.split(/(?:\s{0,},\s{0,})|\s/).filter((cat: string) => cmdCategories.includes(cat));
      return cats.length ? cats : "No cats";
    }
  }
}

// Asks for input for a specific setting
export async function askForValue(
  msg: Message<TextChannel>,
  omsg: Message<TextChannel>,
  bot: HibikiClient,
  category: string,
  config: GuildConfig | UserConfig,
  editFunction: any,
  setting: ValidItem,
) {
  let cooldown = 0;

  await waitFor(
    "messageCreate",
    60000,
    async (m: Message<TextChannel>) => {
      if (m.author.id !== msg.author.id || m.channel.id !== msg.channel.id || !msg.content) return;
      let result = askFor(
        bot,
        m,
        setting.id === "disabledCmds" || setting.id === "disabledCategories" ? setting.id : setting.type,
        m.content,
      );

      const invalidChecks = {
        // Checks if it's not a boolean
        notBoolean: {
          check: setting.type !== "boolean" && !result,
          errorMsg: msg.string("general.CONFIG_ISINVALID"),
        },

        // Checks if it's invalid
        isInvalid: {
          check: typeof result === "string" && result.startsWith("No"),
          errorMsg: msg.string("general.CONFIG_ISINVALID"),
        },

        // Checks if it contains an invite
        containsInvite: {
          check: setting.inviteFilter === true && fullInviteRegex.test(result),
          errorMsg: msg.string("general.CONFIG_CONTAINSINVITE"),
        },

        // Checks role array length
        roleArrayTooLong: {
          check: setting.type === "roleArray" && setting.maximum && result.length > setting.maximum,
          errorMsg: msg.string("general.CONFIG_ROLEARRAYTOOLONG", { maximum: setting.maximum }),
        },

        // Checks channel array length
        channelArrayTooLong: {
          check: setting.type === "channelArray" && setting.maximum && result.length > setting.maximum,
          errorMsg: msg.string("general.CONFIG_CHANNELARRAYTOOLONG", { maximum: setting.maximum }),
        },

        // Checks number size
        invalidNumberSize: {
          check: setting.type === "number" && setting.maximum && (setting.minimum > result || setting.maximum < result),
          errorMsg: msg.string("general.CONFIG_INVALIDNUMBERSIZE"),
        },

        // Invalid string size
        invalidStringSize: {
          check: setting.type === "string" && setting.maximum && setting.maximum < result.length,
          errorMsg: msg.string("general.CONFIG_STRINGTOOLONG", { maximum: setting.maximum }),
        },
      };

      // If an invalid response was given
      let error = "";
      Object.keys(invalidChecks).forEach((checkKey) => {
        if (error) return;
        const check = invalidChecks[checkKey];
        if (check.check) {
          error = check.errorMsg;
        }
      });

      // Sends if something is invalid >:(
      if (error) {
        const errormsg = await msg.createEmbed(
          msg.string("global.ERROR"),
          `${error} ${msg.string("general.CONFIG_ATTEMPTS_LEFT", { attempts: Math.abs(cooldown - 2) })}`,
          "error",
        );

        cooldown++;
        setTimeout(() => {
          errormsg.delete();
        }, 2000);

        // If cooldown reached
        if (cooldown > 2) {
          omsg.edit(editFunction(category, bot));
          return true;
        }

        return;
      }

      // Clears or sets the result
      let resultName: string;
      if (result === "clear") result = null;
      config[setting.id] = result;

      // Updates configs
      if (category === "profile") await bot.db.updateUserConfig(msg.author.id, config);
      else await bot.db.updateGuildConfig(msg.channel.guild.id, config);
      await m.delete().catch(() => {});

      // Formats result names
      switch (setting.type) {
        // Roles
        case "role": {
          resultName = msg.channel.guild.roles.get(result)?.name || result;
          break;
        }

        // Channels
        case "channel": {
          resultName = msg.channel.guild.channels.get(result)?.mention || result;
          break;
        }

        // Role arrays
        case "roleArray": {
          const roleNames: string[] = [];
          await result.forEach((r: string) => {
            const role = msg.channel.guild.roles.get(r)?.name;
            if (role) roleNames.push(role);
            else roleNames.push(r);
          });

          resultName = roleNames.join(", ");
          break;
        }

        // Channel arrays
        case "channelArray": {
          const channelNames: string[] = [];
          await result.forEach((c: string) => {
            const channel = msg.channel.guild.channels.get(c)?.mention;
            if (channel) channelNames.push(channel);
            else channelNames.push(c);
          });

          resultName = channelNames.join(", ");
          break;
        }
      }

      // Sends the success message
      const setmsg = await msg.createEmbed(
        msg.string("global.SUCCESS"),
        `**${localizeSetupItems(msg.string, setting.id, true)}** ${msg.string("global.SET_TO")} **${
          resultName || (result ?? msg.string("global.NOTHING"))
        }**.`,
        "success",
      );
      setTimeout(() => {
        setmsg.delete();
      }, 2000);

      // Edits the original message
      omsg.edit(editFunction(category, bot));
      return true;
    },

    bot,
  ).catch((err) => timeoutHandler(err, omsg, msg.string));
}

// Asks for a locale
export async function askForLocale(
  omsg: Message,
  msg: Message<TextChannel>,
  bot: HibikiClient,
  userconfig: UserConfig | GuildConfig,
  editFunction: any,
  category?: string,
  isGuildConfig?: boolean,
) {
  // Locale emojis
  Object.keys(bot.localeSystem.locales).forEach((locale) => {
    localeEmojis[bot.localeSystem.getLocale(locale, "EMOJI")] = bot.localeSystem.getLocale(locale, "NAME");
    localeNames[bot.localeSystem.getLocale(locale, "EMOJI")] = locale;
  });

  await omsg.removeReactions();
  Object.keys(localeEmojis).forEach(async (emoji) => omsg.addReaction(emoji));
  const string = bot.localeSystem.getLocaleFunction(
    (userconfig as UserConfig)?.locale ? (userconfig as UserConfig)?.locale : bot.config.defaultLocale,
  );

  // Asks for input
  omsg.editEmbed(
    `🌍 ${string("global.ASKFOR_LOCALE")}`,
    Object.entries(localeEmojis)
      .map((locale) => `${locale[0]} ${locale[1]}`)
      .join("\n"),
  );

  // Waits for message reactions for locale
  return waitFor(
    "messageReactionAdd",
    60000,
    async (m: Message<TextChannel>, emoji: Emoji, user: Member) => {
      if (m.id !== omsg.id) return;
      if (user.id !== msg.author.id) return;
      if (!emoji.name) return;

      // Gets the locale and updates config
      const locale = localeNames[emoji.name];
      if (!locale) return;
      (userconfig as UserConfig).locale = locale;
      if (isGuildConfig) bot.db.updateGuildConfig(msg.channel.guild.id, userconfig);
      else bot.db.updateUserConfig(msg.author.id, userconfig);

      // Cleans up afterwards
      await omsg.edit(isGuildConfig ? editFunction(category, bot) : editFunction(bot.localeSystem));
      await omsg.removeReactions();
      return true;
    },

    bot,
  ).catch((err) => {
    if (err !== "timeout") throw err;
  });
}
