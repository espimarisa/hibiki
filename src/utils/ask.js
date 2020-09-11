const waitFor = require("./waitFor");

module.exports = {
  yesNo: async (bot, msg, retMsg = false) => {
    try {
      // Sets the response message, timeout is 15 seconds
      const [resp] = await waitFor("messageCreate", 15000, m => {
        if (m.author.id !== msg.author.id) return false;
        if (m.channel.id !== msg.channel.id) return false;
        // Checks for y/n
        if (m.content.toLowerCase() !== "y" && m.content.toLowerCase() !== "yes" && m.content.toLowerCase() !== "n" && m.content.toLowerCase() !== "no") return false;
        return true;
      }, bot);

      // Checks for yes
      if (resp.content.toLowerCase() === "y" || resp.content.toLowerCase() === "yes") {
        return retMsg ? {
          response: true,
          msg: resp,
        } : true;
      }

      return retMsg ? {
        response: false,
        msg: resp,
      } : false;
    } catch (err) {
      return retMsg ? {
        response: false,
        msg: null,
      } : false;
    }
  },

  for: (type, arg, guild) => {
    if (!type) return "No type";
    if (!arg) return "No arg";
    if (!guild) return "No guild";
    const clear = arg.toLowerCase() === "clear" || arg.toLowerCase() === "off" || arg.toLowerCase() === "null";

    if (type === "roleID") {
      if (clear) return "clear";
      const role = guild.roles.find(r => r.name.toLowerCase().startsWith(arg.toLowerCase()) || r.id === arg || arg === `<@&${r.id}>`);
      if (!role) return "No role";
      return role.id;
    }

    if (type === "channelID") {
      if (clear) return "clear";
      const channel = guild.channels.find(r => (r.name.toLowerCase().startsWith(arg.toLowerCase()) ||
        r.id === arg || arg === `<#${r.id}>`) && r.type === 0);
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
      if (arg.toLowerCase() === "true" ||
        arg.toLowerCase() === "yes" ||
        arg.toLowerCase() === "on") {
        return true;
      } else if (arg.toLowerCase() === "false" ||
        arg.toLowerCase() === "no" ||
        arg.toLowerCase() === "off") {
        return false;
      }
      return "No bool found";
    }

    if (type === "roleArray") {
      if (clear) return "clear";
      arg = arg.split(",");
      const pArgs = [];
      arg.forEach(i => {
        const role = guild.roles.find(r => r.name.toLowerCase().startsWith(i.toLowerCase()) || r.id === i || i === `<@&${r.id}>`);
        if (!role) return;
        pArgs.push(role.id);
      });
      if (!pArgs.length) return "No roles";
      return pArgs;
    }

    if (type === "channelArray") {
      if (clear) return "clear";
      arg = arg.split(",");
      const pArgs = [];
      arg.forEach(i => {
        const channel = guild.channels.find(c => c.name.toLowerCase().startsWith(i.toLowerCase()) || c.id === i || i === `<#${c.id}>`);
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
  },
};
