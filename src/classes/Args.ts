/**
 * @file Args
 * @description Handles and parses command arguments
 */

import type { Member, Message, Role, TextChannel } from "eris";
import type { HibikiClient } from "./Client";

export class Args {
  argtypes: Record<string, any>;
  bot: HibikiClient;

  constructor(bot: HibikiClient) {
    this.bot = bot;
    this.argtypes = {
      // Looks for a boolean
      boolean: (a: string, _msg: Message, flag: string) => {
        if (a === "on" || a === "true" || a === "enable" || (flag === "strict" ? a === "yes" : a.startsWith("y"))) return true;
        if (a === "off" || a === "false" || a === "disable" || (flag === "strict" ? a === "no" : a.startsWith("n"))) return false;
      },

      // Looks for a channel
      channel: (a: string, msg: Message<TextChannel>, flag: string) => {
        const channel = msg.channel.guild.channels.find((c) => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a));
        if (channel?.type === 4 || (channel?.type === 2 && flag !== "allowVoice")) return;
        if (!channel && flag === "fallback") return msg.channel;
        return channel;
      },

      // Looks for a channelArray
      channelArray: (a: string[], msg: Message<TextChannel>) => {
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
      guild: (a: string, _msg: Message, flag: string, b: HibikiClient) => {
        return b.guilds.find((g) => g.id === a || (flag === "strict" ? g.name === a : g.name.startsWith(a)));
      },

      // Looks for a member
      member: (a: string, msg: Message<TextChannel>, flag: string) => {
        const member = msg.channel.guild.members.find((m: Member) =>
          flag !== "strict"
            ? m.user.username.toLowerCase() === a ||
              m.id === a ||
              a.startsWith(`<@!${m.id}>`) ||
              a.startsWith(`<@${m.id}>`) ||
              m.nick?.toLowerCase() === a
            : m.user.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`),
        );

        if ((!a || !member) && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
        if (!flag && member?.id === msg.author.id) return;
        return member;
      },

      number: (a: number, _m: Message<TextChannel>, flag: string) => {
        if (isNaN(a)) return;
        if (flag === "negative") return a;
        if (a < 0) return;
        return a;
      },

      // Looks for a role
      role: (a: string, msg: Message<TextChannel>) => {
        const role = msg.channel.guild.roles.find(
          (r) => r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.toLowerCase().startsWith(a.toLowerCase()),
        );

        return role;
      },

      // Looks for a roleArray
      roleArray: (a: string[], msg: Message<TextChannel>) => {
        const roles: string[] = [];

        a.forEach((i: string) => {
          const role = msg.channel.guild.roles.find(
            (r: Role) => r.name.toLowerCase().startsWith(i.toLowerCase()) || r.id === i || i === `<@&${r.id}>`,
          );

          if (!role) return;
          roles.push(role.id);
        });

        return roles;
      },

      // Looks for a string
      string: (a: string) => {
        return a;
      },

      // Looks for a user ID
      user: (a: string) => {
        const user = bot.users.get(a);
        if (!user || !user.id) return;
        return user;
      },

      voiceChannel: (a: string, msg: Message<TextChannel>) => {
        const channel = msg.channel.guild.channels.find((c) => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a));
        if (!channel || channel?.type !== 2) return;
        return channel;
      },
    };
  }

  parse(argString: string, args: string, msg: Message): any {
    const argObj: Record<string, any>[] = [];

    argString.split(" ").forEach((arg) => {
      const argumentRegex = /(<|\[)(\w{1,}):(\w{1,})&?([\w=*]{1,})?(>|\])/.exec(arg);
      if (!argumentRegex) return;
      argObj.push({
        name: argumentRegex[2],
        type: argumentRegex[3],
        flag: argumentRegex[4],
        optional: argumentRegex[1] === "[",
      });
    });

    // Splits args from the delimiter
    args.split(" ").forEach((arg: string, i: number) => {
      const argument = argObj[i];

      // Handles argument flags
      if (!argument || (!arg && argument.flag !== "fallback")) return;
      if (argument?.flag?.startsWith("ignore=") && arg === argument.flag.split("ignore=")[1]) return argObj.splice(i, 1);

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
