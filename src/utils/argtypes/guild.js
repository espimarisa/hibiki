/**
 * @fileoverview Guild argtype
 * @description Looks for a valid guild
 * @param {Object} guild A valid Discord guild ID
 * @param {String} [strict] Requires the exact guild ID
 */

module.exports = [function guild(a, msg, flag) {
  return this.bot.guilds.find(g => g.id === a || (flag === "strict" ? g.name === a : g.name.startsWith(a)));
}];
