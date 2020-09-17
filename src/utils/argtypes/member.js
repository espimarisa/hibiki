module.exports = [function member(a, msg, flag) {
  const member = msg.channel.guild.members.find(m => flag !== "strict" ?
    m.username.toLowerCase() === a || m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`) ||
    m.nick && m.nick.toLowerCase() === a :
    m.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || a.startsWith(`<@${m.id}>`));
  if ((!a || !member) && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
  if (!flag && member && member.id === msg.author.id) return;
  return member;
}];
