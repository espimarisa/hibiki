/*
  This looks for a valid role.
  It also works with role mentions.
*/

module.exports = [function role(a, msg) {
  msg.channel.guild.roles.find(r => r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.startsWith(a));
  console.log(a);
}];
