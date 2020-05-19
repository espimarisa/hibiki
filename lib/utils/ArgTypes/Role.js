module.exports = [function role(a, msg) {
  const role = msg.channel.guild.roles.find(r => r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.toLowerCase().startsWith(a.toLowerCase()));
  return role;
}];
