/**
 * @file Ask
 * @description Asks for a user's input and validates it
 */

import type { HibikiClient } from "../classes/Client";
import type { Guild, Message, Role } from "eris";
import { waitFor } from "./waitFor";

/** Asks a user for a yes or no response */
export async function askYesNo(bot: HibikiClient, msg: Message) {
  if (!msg.content) return;
  let response: any;

  const no = msg.string("global.NO").toLowerCase();
  const yes = msg.string("global.YES").toLowerCase();
  const sameStartingChar = no[0] === yes[0];

  await waitFor(
    "messageCreate",
    3000,
    (m: Message) => {
      if (!m.content) return;
      if (m.author.id !== msg.author.id) return;
      if (m.channel?.id !== msg?.channel.id) return;

      // If two locales start with the same
      if (sameStartingChar) {
        if (m.content.toLowerCase() === no || m.content.toLowerCase() === no[0]) response = { msg: m, response: false };
        else if (m.content.toLowerCase() === yes || m.content.toLowerCase() === yes[0]) response = { msg: m, response: true };

        // compares shit
      } else if (m.content.toLowerCase().startsWith(no[0])) response = { msg: m, response: false };
      else if (m.content.toLowerCase().startsWith(yes[0])) response = { msg: m, response: true };

      if (!response) response = { msg: null, response: false };
      return true;
    },

    bot,
  );

  return response;
}

export function askFor(type: string, arg: any, guild: Guild) {
  if (!type) return "No type";
  if (!arg) return "No arg";
  if (!guild) return "No guild";
  const clear = arg.toLowerCase() === "clear" || arg.toLowerCase() === "off" || arg.toLowerCase() === "null";

  if (type === "roleID") {
    if (clear) return "clear";
    const role = guild.roles.find((r: Role) => r.name.toLowerCase().startsWith(arg.toLowerCase()) || r.id === arg || arg === `<@&${r.id}>`);
    if (!role || role?.managed) return "No role";
    return role.id;
  }

  if (type === "channelID") {
    if (clear) return "clear";
    const channel = guild.channels.find(
      (r) => (r.name.toLowerCase().startsWith(arg.toLowerCase()) || r.id === arg || arg === `<#${r.id}>`) && r.type === 0,
    );
    if (!channel) return;
    return channel.id;
  }

  if (type === "number") {
    if (clear) return "clear";
    if (isNaN(arg)) return "No number";
    return arg;
  }

  if (type === "string") {
    if (clear) return "clear";
    if (!arg) return "No string";
    return arg;
  }

  if (type === "bool") {
    if (arg.toLowerCase() === "true" || arg.toLowerCase() === "yes" || arg.toLowerCase() === "on") {
      return true;
    } else if (arg.toLowerCase() === "false" || arg.toLowerCase() === "no" || arg.toLowerCase() === "off") {
      return false;
    }
    return "No bool found";
  }

  if (type === "roleArray") {
    if (clear) return "clear";
    arg = arg.split(",");
    const pArgs: string[] = [];
    arg.forEach((i: string) => {
      const role = guild.roles.find((r: Role) => r.name.toLowerCase().startsWith(i.toLowerCase()) || r.id === i || i === `<@&${r.id}>`);
      if (!role) return;
      pArgs.push(role.id);
    });
    if (!pArgs.length) return "No roles";
    return pArgs;
  }

  if (type === "channelArray") {
    if (clear) return "clear";
    arg = arg.split(",");
    const pArgs: string[] = [];
    arg.forEach((i: string) => {
      const channel = guild.channels.find((c) => c.name.toLowerCase().startsWith(i.toLowerCase()) || c.id === i || i === `<#${c.id}>`);
      if (!channel) return;
      pArgs.push(channel.id);
    });
    if (!pArgs.length) return "No channels";
    return pArgs;
  }

  if (type === "emoji") {
    const emoji = /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/.exec(arg);
    if (!emoji) return "No emoji";
    return emoji[0];
  }
}
