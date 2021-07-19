import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class FilterCommand extends Command {
  description = "Adds or removes a word from the filtered list.";
  args = "[word:string] | [remove:string] [id:string]";
  aliases = ["addfilter", "removefilter", "rmfilter"];
  requiredperms = ["manageMessages"];
  staff = true;

  async run(msg: Message<TextChannel>, pargs: ParsedArgs[], args: string[]) {
    // Gets the guildconfig
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig) {
      guildconfig = { id: msg.channel.guild.id, filteredWords: [] };
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);
    } else if (!guildconfig.filteredWords) guildconfig.filteredWords = [];

    // Shows filtered words if no args
    if (!args.length) {
      if (!guildconfig.filteredWords.length) {
        return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.FILTER_NOWORDS"), "error");
      }

      return msg.createEmbed(
        `🛑 ${msg.locale("moderation.FILTER_FILTEREDWORDS")}`,
        guildconfig.filteredWords.map((word) => `\`${word}\``).join(","),
      );
    }

    // Removal support
    else if (["remove", "delete", msg.locale("global.REMOVE"), msg.locale("global.DELETE")].includes(args?.[0]?.toLowerCase())) {
      args.shift();
      const word = args.join(" ");
      const wordIndex = guildconfig.filteredWords.indexOf(word);
      if (wordIndex === -1) return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.FILTER_NOTFILTERED"), "error");
      guildconfig.filteredWords.splice(wordIndex, 1);
      msg.createEmbed(`🛑 ${msg.locale("moderation.FILTER")}`, msg.locale("moderation.FILTER_REMOVED", { word: word }));
    } else {
      // Ignores the first instance of "add" because I am ADHD
      if (args[0].toLowerCase() === "add") args.shift();
      // Adds the word
      const word = args.join(" ");

      // Minimum & maximum
      if (word.length < 3 || word.length > 32) {
        return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.FILTER_THRESHOLD"), "error");
      }

      // If the word already exists
      if (guildconfig.filteredWords.includes(word)) {
        return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("moderation.FILTER_ALREADYFILTERED"), "error");
      }

      // Updates the DB
      guildconfig.filteredWords.push(word);
      msg.createEmbed(msg.locale("global.SUCCESS"), msg.locale("moderation.FILTER_ADDED", { word: word }), "success");
    }

    await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
  }
}
