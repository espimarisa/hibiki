/**
 * @file Args
 * @description Handles and parses command arguments
 */

import type { Message } from "eris";
import type { HibikiClient } from "./Client";
import type { ArgTypes } from "../typings/argtypes";
import { getRESTUser } from "../utils/getRESTUser";

export class Args {
  argtypes: ArgTypes;
  bot: HibikiClient;

  constructor(bot: HibikiClient) {
    this.bot = bot;
    this.argtypes = {
      // Looks for a boolean
      boolean: (a, _msg, flag) => {
        if (a === "on" || a === "true" || a === "enable" || (flag?.includes("strict") ? a === "yes" : a.startsWith("y"))) return true;
        if (a === "off" || a === "false" || a === "disable" || (flag?.includes("strict") ? a === "no" : a.startsWith("n"))) return false;
      },

      // Looks for a channel
      channel: (a, msg, flag) => {
        const channel = msg.channel.guild.channels.find((c) => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a));
        if (channel?.type === 4 || (channel?.type === 2 && flag?.includes("allowVoice"))) return;
        if (!channel && flag.includes("fallback")) return msg.channel;
        return channel;
      },

      // Looks for a channelArray
      channelArray: (a, msg) => {
        const channels: string[] = [];
        a.forEach((i: string) => {
          const channel = msg.channel.guild.channels.find(
            (c) => c.name.toLowerCase().startsWith(i.toLowerCase()) || c.id === i || i === `<#${c.id}>`,
          );

          if (!channel) return;
          if (channel?.type !== 0) return;
          channels.push(channel.id);
        });

        if (!channels.length) return "No channels";
        return channels;
      },

      // Looks for a guild
      guild: (a, _msg, flag, b) => {
        return b.guilds.find((g) => g.id === a || (flag?.includes("strict") ? g.name === a : g.name.startsWith(a)));
      },

      // Looks for a member
      member: (a, msg, flag) => {
        const member = msg.channel.guild?.members?.find((m) =>
          !flag?.includes("strict")
            ? m.user.username.toLowerCase() === a ||
              m.id === a ||
              a.startsWith(`<@!${m.id}>`) ||
              a.startsWith(`<@${m.id}>`) ||
              m.nick?.toLowerCase() === a ||
              m.user.username.startsWith(a)
            : m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`),
        );

        // If no member found, try to use REST mode
        if (!member && flag?.includes("userFallback")) return this.argtypes.user(a, msg, ["REST"]);

        if ((!a || !member) && flag?.includes("fallback")) return msg.channel.guild?.members?.get(msg.author.id);
        if (!flag && member?.id === msg.author.id) return;

        return member;
      },

      number: (a, _msg, flag) => {
        if (isNaN(a)) return;
        if (flag?.includes("negative")) return a;
        if (a < 0) return;
        return a;
      },

      // Looks for a role
      role: (a, msg) => {
        const role = msg.channel.guild.roles.find(
          (r) => (r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.toLowerCase().startsWith(a.toLowerCase())) && !r.managed,
        );

        return role;
      },

      // Looks for a roleArray
      roleArray: (a, msg) => {
        const roles: string[] = [];

        a.forEach((i) => {
          const role = msg.channel.guild.roles.find(
            (r) => (r.name.toLowerCase().startsWith(i.toLowerCase()) || r.id === i || i === `<@&${r.id}>`) && !r.managed,
          );

          if (!role) return;
          roles.push(role.id);
        });

        return roles;
      },

      // Looks for a string
      string: (a) => {
        return a;
      },

      user: async (a, msg, flag) => {
        // Attempt to find cached
        let user = this.bot.users.find((u) => u.id === a || a.startsWith(`<@!${u.id}>`) || a.startsWith(`<@${u.id}>`));

        // Tries to find the member via REST mode
        if (!user?.id && flag?.includes("REST")) user = await getRESTUser(a, this.bot);
        if (!user?.id) return;
        return user;
      },

      voiceChannel: (a, msg) => {
        const channel = msg.channel.guild.channels.find((c) => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a));
        if (!channel || channel?.type !== 2) return;
        return channel;
      },
    };
  }

  async parse(argString: string, args: string, msg: Message): Promise<ParsedArgs[]> {
    const argObj: ParsedArgs[] = [];

    argString.split(" ").forEach((arg) => {
      const argumentRegex = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*,]{1,})?(>|\])/.exec(arg);
      if (!argumentRegex) return;
      argObj.push({
        name: argumentRegex[2],
        type: argumentRegex[3],
        flag: argumentRegex[4]?.split(","),
        optional: argumentRegex[1] === "[",
      });
    });

    // Splits args from the delimiter
    args.split(" ").forEach((arg: string, i: number) => {
      const argument = argObj[i];

      // Handles argument flags
      if (!argument || (!arg && !argument.flag?.includes("fallback"))) return;

      // Handles invalid argtypes
      if (!this.argtypes[argument.type]) return;

      // Gets the argtype
      const value = this.argtypes[argument.type](arg.toLowerCase(), msg, argument.flag, this.bot);
      if (typeof value == "undefined") return;

      argument.value = value;
      argObj[i] = argument;
    });

    return argObj;
  }
}
