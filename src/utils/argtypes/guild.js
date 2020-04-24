module.exports = [function guild(a, msg, flag) {
  this.bot.guilds.find(g => g.id === a || (flag == "strict" ? g.name == a : g.name.startsWith(a)))
}];
