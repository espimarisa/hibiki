import type { ApplicationCommandOptionData, CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";
import { localiseAnimalCommandTitle } from "../../utils/localiser";

export type ANIMAL_TYPES = "cat" | "dog" | "fox";

export class AnimalCommand extends HibikiCommand {
  description = "Sends a random picture of different animals.";

  options: ApplicationCommandOptionData[] = [
    {
      name: "type",
      description: "The type of animal to get a picture of.",
      type: 2,
      options: [
        {
          name: "cat",
          description: "Sends a random picture of a cat.",
          type: 1,
        },
        {
          name: "dog",
          description: "Sends a random picture of a dog.",
          type: 1,
        },
        {
          name: "fox",
          description: "Sends a random picture of a fox.",
          type: 1,
        },
      ],
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    const subcommand = interaction.options.getSubcommand() as ANIMAL_TYPES | null;

    // Handler for if no option was provided
    if (!subcommand) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("image.COMMAND_ANIMAL_NOSUBCOMMAND"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Returns a URL
    const animalURL = await this.getSubCommandResponse(subcommand);
    if (!animalURL) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("image.COMMAND_IMAGE_FAILED"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    // Gets locale
    const animalLocaleData = localiseAnimalCommandTitle(interaction.getString, subcommand);

    // Sends the image
    await interaction.reply({
      embeds: [
        {
          title: animalLocaleData[0],
          color: this.bot.config.colours.primary,
          image: {
            url: animalURL,
          },
          footer: {
            icon_url: this.bot.user?.displayAvatarURL({ dynamic: true }),
            text: animalLocaleData[1],
          },
        },
      ],
    });
  }

  public async getSubCommandResponse(commandName: string): Promise<string | undefined> {
    switch (commandName) {
      /**
       * Gets a picture of a cat
       */

      case "cat": {
        const body = await fetch("https://aws.random.cat/meow");

        const response = await body.json();
        return response.file ? response.file : undefined;
      }

      /**
       * Gets a picture of a dog
       */

      case "dog": {
        const body = await fetch("https://random.dog/woof.json");

        const response = await body.json();
        return response.url ? response.url : undefined;
      }

      /**
       * Gets a picture of a fox
       */

      case "fox": {
        const body = await fetch("https://randomfox.ca/floof/");

        const response = await body.json();
        return response.image ? response.image : undefined;
      }

      default:
        return;
    }
  }
}
