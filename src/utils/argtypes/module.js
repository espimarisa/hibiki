/*
  This looks for any Hibiki modules.
  If strict flag, require the command ID.
*/

module.exports = [function command(a, msg, flag) { this.bot.commands.find(c => flag === "strict" ? c.id === a : c.id.startsWith(a) || (c.aliases && c.aliases.includes(a))); },
  function event(a, msg, flag) { this.bot.events.find(e => flag === "strict" ? c.id === a : e.id.toLowerCase().startsWith(a)); },
  function module(a) { this.bot.commands.find(c => c.id.toLowerCase().startsWith(a) || (c.aliases && c.aliases.includes(a))); },
];
