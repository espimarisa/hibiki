import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import { hibikiVersion } from "../../utils/constants.js";
import fetch from "../../utils/fetch.js";
import { createFullTimestamp } from "../../utils/timestamp.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

// Urban dictionary word type definition
interface UrbanWord {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: Date;
  example: string;
  thumbs_down: number;
}

export class UrbanCommand extends HibikiCommand {
  description = "Looks up the definition of a word from the Urban Dictionary.";
  options: APIApplicationCommandOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "word",
      description: "The word to get a definition for.",
      required: true,
    },
  ];

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString(this.options[0].name, true);

    // Encodes the word and fetches it
    const encodedQuery = encodeURIComponent(query);
    const response = await fetch(`http://api.urbandictionary.com/v0/define?term=${encodedQuery}`, {
      headers: {
        "User-Agent": `hibiki/${hibikiVersion} (https://github.com/sysdotini/hibiki)`,
      },
    });

    const body = await response?.json();

    // Handler if the word doesn't exist
    if (!body || !body.list) {
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_URBAN_NODEFINITION", { word: query }),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Finds the top word
    const topword = body.list?.sort?.((a: UrbanWord, b: UrbanWord) => b?.thumbs_up - a?.thumbs_up);
    const word = topword[0] as UrbanWord;

    // If the word has no definition
    if (!topword || !word || !word?.definition) {
      await interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_URBAN_NODEFINITION", { word: word }),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Removes [] from definitions and examples
    word.definition = topword[0].definition.replace(/[[\]]/g, "");
    word.example = topword[0].example.replace(/[[\]]/g, "");

    // Trims the definition if needed
    if (word.definition.length > 1024) {
      const fullstop = word.definition.slice(0, 1024).lastIndexOf(".");
      word.definition = word.definition.slice(0, fullstop + 1);
    }

    const fields: EmbedField[] = [];

    // Example
    if (word.example) {
      fields.push({
        name: interaction.getString("utilities.COMMAND_URBAN_EXAMPLE"),
        value: `${word.example}`,
        inline: false,
      });
    }

    // Written on
    if (word.written_on) {
      fields.push({
        name: interaction.getString("utilities.COMMAND_URBAN_WRITTENON"),
        value: createFullTimestamp(new Date(word.written_on)),
        inline: false,
      });
    }

    // Thumbs up
    if (word.thumbs_up) {
      fields.push({
        name: interaction.getString("utilities.COMMAND_URBAN_UPVOTES"),
        value: `${word.thumbs_up}`,
        inline: true,
      });
    }

    // Thumbs down
    if (word.thumbs_down) {
      fields.push({
        name: interaction.getString("utilities.COMMAND_URBAN_DOWNVOTES"),
        value: `${word.thumbs_down}`,
        inline: true,
      });
    }

    // Sends info about the word
    await interaction.reply({
      embeds: [
        {
          title: `📘 ${word.word}`,
          description: `${word.definition}`,
          fields: fields.length > 0 ? fields : undefined,
          color: this.bot.config.colours.primary,
        },
      ],
    });
  }
}
