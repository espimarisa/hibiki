import type { Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";

export class WordFilterCommand extends Command {
  description = "Adds or removes a word from the filtered list.";
  args = "[word:string] | [remove:string] [id:string]";
  aliases = ["addfilter", "removefilter", "rmfilter"];
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
        return msg.createEmbed((msg.string("global.ERROR"), msg.string("moderation.FILTER_NOWORDS"), "error"));
      }

      return msg.createEmbed(
        `🛑 ${msg.string("moderation.FILTER_FILTEREDWORDS")}`,
        guildconfig.filteredWords.map((word) => `\`${word}\``).join(","),
      );
    }

    // Removal support
    else if (args[0] === "remove") {
      args.shift();
      const word = args.join(" ");
      const wordIndex = guildconfig.filteredWords.indexOf(word);
      if (wordIndex === -1) return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.FILTER_NOTFILTERED"), "error");
      else guildconfig.filteredWords.splice(wordIndex, 1);
    }

    // Adds the word
    const word = args.join(" ");

    // Minimum & maximum
    if (word.length < 3 || word.length > 32) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.FILTER_THRESHOLD"), "error");
    }

    // If the word already exists
    if (guildconfig.filteredWords.includes(word)) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("moderation.FILTER_ALREADYFILTERED"), "error");
    }

    // Updates the DB
    guildconfig.filteredWords.push(word);
    await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
  }
}
