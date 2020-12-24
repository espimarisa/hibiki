/**
 * @file Args
 * @description Handles and parses command arguments
 */

import type { Member, Message, TextChannel } from "eris";
import type { HibikiClient } from "./Client";

export class Args {
  argtypes: Record<string, any>;
  bot: HibikiClient;

  constructor(bot: HibikiClient) {
    this.bot = bot;
    this.argtypes = {
      boolean: (a: string, _msg: Message, flag: string) => {
        if (a === "on" || a === "true" || a === "enable" || (flag === "strict" ? a === "yes" : a.startsWith("y"))) return true;
        if (a === "off" || a === "false" || a === "disable" || (flag === "strict" ? a === "no" : a.startsWith("n"))) return false;
      },

      channel: (a: string, msg: Message<TextChannel>, flag: string) => {
        const channel = msg.channel.guild.channels.find((c) => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a));
        if (!channel && flag === "fallback") return msg.channel;
        return channel;
      },

      guild: (a: string, _msg: Message, flag: string, b: HibikiClient) => {
        return b.guilds.find((g) => g.id === a || (flag === "strict" ? g.name === a : g.name.startsWith(a)));
      },

      member: (a: string, msg: Message<TextChannel | any>, flag: string) => {
        const member = msg.channel.guild.members.find((m: Member) =>
          flag !== "strict"
            ? m.username.toLowerCase() === a ||
              m.id === a ||
              a.startsWith(`<@!${m.id}>`) ||
              a.startsWith(`<@${m.id}>`) ||
              (m.nick && m.nick.toLowerCase() === a)
            : m.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`),
        );

        if ((!a || !member) && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
        if (!flag && member && member.id === msg.author.id) return;
        return member;
      },

      role: (a: string, msg: Message<TextChannel>) => {
        const role = msg.channel.guild.roles.find(
          (r) => r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.toLowerCase().startsWith(a.toLowerCase()),
        );

        return role;
      },

      string: (a: string) => {
        return a;
      },

      user: (a: string) => {
        const user = bot.users.get(a);
        if (!user || !user.id) return;
        return user;
      },
    };
  }

  parse(argString: string, args: string, msg: Message): any {
    const argObj: any[] = [];

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
      if (argument.flag && argument.flag.startsWith("ignore=") && arg === argument.flag.split("ignore=")[1]) return argObj.splice(i, 1);

      // Handles invalid argtypes
      if (!this.argtypes[argument.type]) return;

      // Gets the argtype
      const value = this.argtypes[argument.type](arg.toLowerCase(), msg, argument.flag, this.bot);
      if (typeof value == "undefined") return;

      argument.value = value;
      argObj[i] = argument;
      // argObj.map((val) => `${val.optional ? "[" : "<"}${val.name}${val.optional ? "]" : ">"}`).join(" ");
    });

    return argObj;
  }
}
