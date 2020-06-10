/**
 * @fileoverview Command class
 * @description Sets command paramaters
 */

class Command {
  constructor(bot, category, id, params) {
    this.bot = bot;
    this.category = category;
    this.id = id;

    if (params) {
      this.aliases = params.aliases ? params.aliases : [];
      this.args = params.args;
      this.allowdisable = params.allowdisable ? params.allowdisable : true;
      this.allowdms = params.allowdms ? params.allowdms : false;
      this.clientperms = params.clientperms;
      this.cooldown = params.cooldown;
      this.description = params.description;
      this.keys = params.keys ? params.keys : [];
      this.nsfw = params.nsfw ? params.nsfw : false;
      this.owner = params.owner ? params.owner : false;
      this.requiredperms = params.requiredperms;
      this.staff = params.staff ? params.staff : false;
    }
  }
}

module.exports = Command;
