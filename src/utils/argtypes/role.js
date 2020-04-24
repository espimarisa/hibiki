module.exports = [function role(a, msg) { msg.channel.guild.roles.find(r => r.id === a || a.startsWith(`<@&${r.id}>`) || r.name.startsWith(a)) }];
