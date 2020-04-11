// todo: utilise this properly for things such as pronouns.. etc.
const Command = require("../../lib/structures/Command");
// Sets valid fields
const fields = { field1: (a) => a == "yes" || a == "no" || a == "maybe" };
let _insert = false;

class setinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      description: "Sets custom profile info",
      cooldown: 2,
    });
  }

  async run(msg, args) {
    let field = args.shift();
    if (!field || !args || !fields[field]) return msg.channel.createMessage(`invalid, valid fields are: ${Object.keys(fields).map(f => `\`${f}\``).join(",")}`);
    if (!fields[field](args.join(" "))) return msg.channel.createMessage("invalid");
    let usercfg = await this.bot.db.table("usercfg").get(msg.author.id);
    if (!usercfg) {
      usercfg = { id: msg.author.id };
      _insert = true;
    }
    if (!usercfg.info) usercfg.info = {};
    usercfg.info[field] = args.join(" ");
    if (!_insert) await this.bot.db.table("usercfg").get(msg.author.id).update(usercfg);
    else await this.bot.db.table("usercfg").insert(usercfg);
    msg.channel.createMessage("set");
  }
}

module.exports = setinfoCommand;
