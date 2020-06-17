module.exports = [function channel(a, msg, flag) {
  const channel = msg.channel.guild.channels.find(c => c.id === a || a.startsWith(`<#${c.id}>`) || c.name.startsWith(a));
  if (!channel && flag === "fallback") return msg.channel;
  return channel;
}];
