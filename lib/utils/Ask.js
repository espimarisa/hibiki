/*
  Ask Utility
  This handles things such as asking for yes or no,
*/

const Wait = require("../utils/Wait");

module.exports = {
  YesNo: async (bot, msg, retMsg = false) => {
    try {
      // Sets the response message, timeout is 15 seconds
      const [resp] = await Wait("messageCreate", 15000, m => {
        // Returns if author/channel is invalid
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
      // Returns false
      return retMsg ? {
        response: false,
        msg: resp,
      } : false;
    } catch (_) {
      return retMsg ? {
        response: false,
        msg: null,
      } : false;
    }
  },
};
