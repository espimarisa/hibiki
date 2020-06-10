/**
 * @fileoverview Member argtype
 * @description Looks for a valid member
 * @param {Object} member A valid Discord member or user ID
 * @param {string} [member.strict] Requires an exact ID or mention
 * @param {string} [member.fallback] Falls back to the author if no member was found
 */

module.exports = [function member(a, msg, flag) {
  const member = msg.channel.guild.members.find(m => flag !== "strict" ?
    m.username.toLowerCase() === a || m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`) :
    m.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`));
  if ((!a || !member) && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
  if (!flag && member && member.id === msg.author.id) return;
  return member;
}];
