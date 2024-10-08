import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { hibikiFetch } from "$utils/fetch.ts";
import { t } from "$utils/i18n.ts";
import { createFullTimestamp } from "$utils/timestamp.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";

const API_BASE_URL = "http://api.urbandictionary.com/v0/define?term=";

export class UrbanCommand extends HibikiCommand {
  userInstallable = true;

  options: HibikiCommandOptions[] = [
    {
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async runCommand(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString((this.options as APIOption[])[0]!.name, true);
    const fields: EmbedField[] = [];

    // Gets the initial response
    const response = await hibikiFetch(`${API_BASE_URL}${encodeURIComponent(query)}`);

    // Converts response; handles errors
    const body = await response?.json();
    if (!(response && body?.list?.length)) {
      await sendErrorReply("commands:COMMAND_URBAN_NODEFINITION", interaction);
      return;
    }

    // Finds the top word
    const topword = body.list.sort((a: UrbanWord, b: UrbanWord) => b?.thumbs_up - a?.thumbs_up);
    const word: UrbanWord = topword?.[0];

    // Error handler for words with no definition
    if (!(topword && word?.definition)) {
      await sendErrorReply("commands:COMMAND_URBAN_NODEFINITION", interaction);
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

    // Used in example
    if (word.example) {
      fields.push({
        name: t("commands:COMMAND_URBAN_EXAMPLE", { lng: interaction.locale }),
        value: `${word.example}`,
        inline: false,
      });
    }

    // Written on
    if (word.written_on) {
      fields.push({
        name: t("commands:COMMAND_URBAN_WRITTENON", { lng: interaction.locale }),
        value: createFullTimestamp(new Date(word.written_on)),
        inline: false,
      });
    }

    // Upvote count
    if (word.thumbs_up) {
      fields.push({
        name: t("global:UPVOTES", { lng: interaction.locale, count: word.thumbs_up }),
        value: word.thumbs_up.toString(),
        inline: true,
      });
    }

    // Downvote count
    if (word.thumbs_down) {
      fields.push({
        name: t("global:DOWNVOTES", { lng: interaction.locale, count: word.thumbs_down }),
        value: word.thumbs_down.toString(),
        inline: true,
      });
    }

    // Sends info about the word
    await interaction.followUp({
      embeds: [
        {
          title: `📘 ${word.word}`,
          description: word.definition,
          fields: fields ?? undefined,
          color: HibikiColors.GENERAL,
        },
      ],
    });
  }
}

// A word from the Urban Dictionary API - http://api.urbandictionary.com/v0/define?term=word
interface UrbanWord {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls?: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: Date;
  example: string;
  thumbs_down: number;
}
