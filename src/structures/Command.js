/**
 * @fileoverview Command class
 * @description Manages commands and their paramaters
 */

class Command {
  /**
   * Creates a command
   * @param {object} bot Main bot object
   * @param {string} category The command's category, inherited from it's folder
   * @param {string} id The command's name, inherited from it's filename
   * @param {object} params The command's paramaters
   */

  constructor(bot, category, id, params) {
    this.bot = bot;
    this.category = category;
    this.id = id;

    if (params) {
      this.aliases = params.aliases ? params.aliases : [];
      this.args = params.args;
      this.argsDelimiter = params.argsDelimiter || " ";
      this.allowdisable = params.allowdisable === undefined ? true : params.allowdisable;
      this.allowdms = params.allowdms ? params.allowdms : false;
      this.clientperms = params.clientperms;
      this.cooldown = params.cooldown;
      this.description = params.description;
      this.nsfw = params.nsfw ? params.nsfw : false;
      this.owner = params.owner ? params.owner : false;
      this.requiredkeys = params.requiredkeys ? params.requiredkeys : [];
      this.requiredperms = params.requiredperms;
      this.staff = params.staff ? params.staff : false;
    }
  }
}

module.exports = Command;
