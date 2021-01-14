/**
 * @file Ask
 * @description Asks for a user's input and validates it
 * @module utils/ask
 */

import type { HibikiClient } from "../classes/Client";
import type { Channel, Message, Role, TextChannel, VoiceChannel } from "eris";
import { defaultEmojiRegex, fullInviteRegex } from "../helpers/constants";
import { localizeSetupItems } from "../utils/format";
import { timeoutHandler, waitFor } from "./waitFor";

import dayjs from "dayjs";

// Dayjs plugins
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

/** Asks a user for a yes or no response */
export async function askYesNo(bot: HibikiClient, msg: Message) {
  if (!msg.content) return;
  let response: Promise<any> | Record<string, unknown>;

  const no = msg.string("global.NO").toLowerCase();
  const yes = msg.string("global.YES").toLowerCase();
  const sameStartingChar = no[0] === yes[0];

  await waitFor(
    "messageCreate",
    15000,
    (m: Message) => {
      if (!m.content) return;
      if (m.author.id !== msg.author.id) return;
      if (m.channel?.id !== msg?.channel.id) return;

      // If two locales start with the same y/n chars
      if (sameStartingChar) {
        if (m.content.toLowerCase() === no) response = { msg: m, response: false };
        else if (m.content.toLowerCase() === yes) response = { msg: m, response: true };
      } else if (m.content.toLowerCase().startsWith(no[0])) response = { msg: m, response: false };
      else if (m.content.toLowerCase().startsWith(yes[0])) response = { msg: m, response: true };
      if (!response) response = { msg: null, response: false };
      return true;
    },

    bot,
  );

  return response;
}

/** Asks for a specific type of input */
export function askFor(bot: HibikiClient, msg: Message<TextChannel>, type: string, arg: any) {
  if (!type) return "No type";
  if (!arg) return "No arg";
  if (!msg.channel.guild) return "No guild";
  const clear = arg.toLowerCase() === "clear" || arg.toLowerCase() === "off" || arg.toLowerCase() === "null";

  // Looks for a role
  if (type === "roleID") {
    const role = bot.args.argtypes.role(arg, msg, undefined) as Role | undefined;
    if (clear) return "clear";
    if (!role || role?.managed) return "No role";
    return role.id;
  }

  // Looks for a channel
  if (type === "channelID") {
    const channel = bot.args.argtypes.channel(arg, msg, undefined) as Channel | undefined;
    if (clear) return "clear";
    if (!channel) return;
    return channel.id;
  }

  // Looks for a voice Channel
  if (type === "voiceChannel") {
    const channel = bot.args.argtypes.voiceChannel(arg, msg, undefined) as VoiceChannel | undefined;
    if (clear) return "clear";
    if (channel.type !== 2) return "Invalid channel type";
    if (!channel) return;
    return channel.id;
  }

  // Looks for a number
  if (type === "number") {
    const number = bot.args.argtypes.number(arg, msg) as number | undefined;
    if (!number) return "No number";
    return number;
  }

  // Looks for a string
  if (type === "string") {
    const string = bot.args.argtypes.string(arg) as string;
    if (clear) return "clear";
    if (!string) return "No string";
    return string;
  }

  // Looks for a boolean
  if (type === "bool") {
    const boolean = bot.args.argtypes.boolean(arg, undefined, arg) as boolean;
    if (!boolean) return "No boolean";
    return boolean;
  }

  if (type === "roleArray") {
    const roles = bot.args.argtypes.roleArray(arg.split(/(?:\s{0,},\s{0,})|\s/), msg) as string[];
    if (!roles?.length) return "Invalid rolearray";
    return roles;
  }

  if (type === "channelArray") {
    const channels = bot.args.argtypes.channelArray(arg.split(/(?:\s{0,},\s{0,})|\s/), msg) as string[];
    if (!channels?.length) return "Invalid channelArray";
    return channels;
  }

  if (type === "emoji") {
    const emoji = defaultEmojiRegex.exec(arg);
    if (!emoji) return "No emoji";
    return emoji[0];
  }

  if (type === "timezone") {
    let invalidTimezone = false;
    try {
      dayjs(new Date()).tz(arg);
    } catch (err) {
      invalidTimezone = true;
    }

    if (invalidTimezone) return "No valid timezone";
    return arg;
  }
}

/** Asks for input for a specific setting */
export async function askForValue(
  msg: Message<TextChannel>,
  omsg: Message<TextChannel>,
  bot: HibikiClient,
  category: string,
  config: GuildConfig | UserConfig,
  editFunction: any,
  setting: Record<string, any>,
) {
  let cooldown = 0;

  await waitFor(
    "messageCreate",
    60000,
    async (m: Message) => {
      if (m.author.id !== msg.author.id || m.channel.id !== msg.channel.id || !msg.content) return;
      let result = askFor(bot, m as Message<TextChannel>, setting.type, m.content);

      const invalidChecks = {
        notBoolean: {
          check: setting.type !== "bool" && !result,
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

        // role arrayyyy
        roleArrayTooLong: {
          check: setting.type === "roleArray" && setting.maximum && result.length > setting.maximum,
          errorMsg: msg.string("general.CONFIG_ROLEARRAYTOOLONG", { maximum: setting.maximum }),
        },

        // chanenlewlewlplp
        channelArrayTooLong: {
          check: setting.type === "channelArray" && setting.maximum && result.length > setting.maximum,
          errorMsg: msg.string("general.CONFIG_CHANNELARRAYTOOLONG", { maximum: setting.maximum }),
        },

        invalidNumberSize: {
          check: setting.type === "number" && setting.maximum && (setting.minimum > result || setting.maximum < result),
          errorMsg: msg.string("general.CONFIG_INVALIDNUMBERSIZE"),
        },
      };
      //

      // If an invalid repsonse was given
      let error: string | undefined;
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
      if (result === "clear") result = null;
      config[setting.id] = result;

      // Updates configs
      if (category === "profile") await bot.db.updateUserConfig(msg.author.id, config);
      else await bot.db.updateGuildConfig(msg.channel.guild.id, config);
      m.delete();

      // Sends a success message
      const setmsg = await msg.createEmbed(
        msg.string("global.SUCCESS"),
        // TODO: Localize result types.
        // TODO: Localize setting return (i.e channelID)
        `**${localizeSetupItems(msg.string, setting.id, true)}** ${msg.string("global.SET_TO")} **${result}**.`,
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
