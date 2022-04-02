import type { ApplicationCommandOptionData, CommandInteraction, MessageOptions } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";

export class FactCommand extends HibikiCommand {
  description = "Get a random fact.";

  options: ApplicationCommandOptionData[] = [
    {
      name: "Category",
      description: "The type of fact to get.",
      required: false,
      type: 3,
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
      factApis.find((a) => a.category === interaction.options.getString("category")) ||
      factApis[Math.floor(Math.random() * factApis.length)];

    const body = await fetch(api.url);

    // TODO: Type this response
    const response: any = await body.json();
    let fact;

    // NOTE: Else if is faster here
    if (response["facts"]) fact = response["facts"][0];
    else if (response["data"]) fact = response["data"];
    else if (response["fact"]) fact = response["fact"];

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
          color: this.bot.config.colours.primary,
        },
      ],
    };

    interaction.channel?.send(messageResponse) || interaction.reply(messageResponse);
  }
}
