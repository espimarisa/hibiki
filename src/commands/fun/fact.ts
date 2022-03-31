import type { ApplicationCommandOptionData, CommandInteraction, MessageOptions } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";

export class FactCommand extends HibikiCommand {
  description = "Get a random fact.";

  options?: ApplicationCommandOptionData[] | undefined = [
    {
      name: "Category",
      description: "The category of the fact to get.",
      required: false,
      type: "STRING",
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

    const api =
      factApis.find((api) => api.category === interaction.options.getString("category")) ||
      factApis[Math.floor(Math.random() * factApis.length)];

    const body = await fetch(api.url);

    const response: any = await body.json();
    // eslint-disable-next-line unicorn/no-null
    let fact = null;

    if (response["facts"]) {
      fact = response["facts"][0];
    }

    if (response["data"]) {
      fact = response["data"];
    }

    if (response["fact"]) {
      fact = response["fact"];
    }

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

    const messageResponse: MessageOptions = {
      embeds: [
        {
          title: interaction.getString("fun.COMMAND_FACT_TITLE"),
          description: fact,
        },
      ],
    };

    interaction?.channel?.send(messageResponse) || interaction.reply(messageResponse);
  }
}
