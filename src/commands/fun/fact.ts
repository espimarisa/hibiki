import type { APIApplicationCommandOption } from "discord-api-types/v10";
import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import fetch from "../../utils/fetch.js";
import { ApplicationCommandOptionType } from "discord-api-types/v10";

type FactApiResponse = {
  facts?: string[];
  data?: string;
  fact?: string;
};

export class FactCommand extends HibikiCommand {
  description = "Get a random fact.";

  options: APIApplicationCommandOption[] = [
    {
      name: "category",
      description: "The type of fact to get.",
      required: false,
      type: ApplicationCommandOptionType.String,
      choices: [
        {
          name: "Cat",
          value: "cat",
        },
        {
          name: "Dog",
          value: "dog",
        },
        {
          name: "Random",
          value: "random",
        },
      ],
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    // An array of API information to fetch
    const factApis = [
      {
        url: "https://catfact.ninja/fact",
        category: "cat",
        factObject: "fact",
      },
      {
        url: "https://dog-api.kinduff.com/api/facts",
        category: "dog",
        factObject: "facts",
      },
      {
        url: "https://useless-facts.sameerkumar.website/api",
        category: "random",
        factObject: "data",
      },
    ];

    // Gets the fact category and what API to query
    const category = interaction.options.getString(this.options[0].name) || "random";
    const api = factApis.find((a) => a.category === category) || factApis[Math.floor(Math.random() * factApis.length)];

    // Fetches the fact information
    const body = await fetch(api.url);
    const response: FactApiResponse = await body.json();
    let fact;

    // Figures out what to set the fact info to
    if (response["facts"]) fact = response["facts"][0];
    else if (response["data"]) fact = response["data"];
    else if (response["fact"]) fact = response["fact"];

    // Sends if no fact was found
    if (!fact) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("fun.COMMAND_FACT_ERROR"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // todo type
    const messageResponse = {
      embeds: [
        {
          title: interaction.getString("fun.COMMAND_FACT_TITLE"),
          description: fact,
          color: this.bot.config.colours.primary,
        },
      ],
    };

    interaction.reply(messageResponse);
  }
}
