module.exports = [function member(a, msg, flag) {
  // No autocomplete
  const member = msg.channel.guild.members.find(m => flag !== "strict" ?
    m.username.toLowerCase() === a || m.id === a || msg.mentions.includes(m.user) :
    m.username.startsWith(a) || m.id === a || a.startsWith(`<@!${m.id}>`) || msg.mentions.includes(m.user));
  // Use user if no member found
  if ((!a || !member) && flag === "fallback") return msg.channel.guild.members.get(msg.author.id);
  return member;
}];
