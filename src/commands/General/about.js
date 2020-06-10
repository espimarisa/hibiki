const Command = require("structures/Command");
const format = require("utils/format");
const os = require("os");

class aboutCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["aboutbot", "info", "stats", "uptime"],
      description: "Returns info & stats about the bot.",
      allowdms: true,
    });
  }

   run(msg) {
    function formatOS(platform, release) {
      switch (platform) {
        case "darwin":
          return `macOS ${(parseFloat(release).toFixed(2) - parseFloat("7.6").toFixed(2) + parseFloat("0.03")).toFixed(2)}`;
        case "linux":
          return `Linux ${release}`;
        case "win32":
          return `Windows ${release}`;
        default:
          return platform;
      }
    }
  }
}

module.exports = aboutCommand;
