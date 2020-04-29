/*
  This looks for a valid member.
  If strict flag, require a valid ID/mention.
  If fallback flag, use the author if no member found.
*/

module.exports = [function member(a, msg, flag) {
  const member = msg.channel.guild.members.find(m => flag !== "strict" ?
    m.username.toLowerCase() === a || m.id === a || msg.mentions.includes(m.user) :
    m.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || msg.mentions.includes(m.user));
  if ((!a || !member) && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
  if (!flag && member && member.id === msg.author.id) return;
  return member;
}];
