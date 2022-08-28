import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import fetch from "../../utils/fetch.js";
import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

export class NpmCommand extends HibikiCommand {
  description = "Returns information about a NPM package";

  options: APIApplicationCommandOption[] = [
    {
      name: "package",
      description: "The package to return information about. Ex: `discord.js` or `@discordjs/voice`",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    if (!interaction.isChatInputCommand) return;

    const packageName = await interaction.options.getString("package");

    // If the package doesn't exist
    if (!packageName) {
      await interaction.followUp({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_NPM_NO_RESULTS"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }
    const data = await fetch(`https://registry.npmjs.com/${packageName}`);
    const packageInfo: NpmPackage = await data.json();

    await interaction.followUp({
      embeds: [
        {
          title: `:package: ${packageInfo.name}`,
          url: `https://npmjs.com/package/${packageInfo.name}`,
          description: packageInfo.description,
          color: this.bot.config.colours.primary,
          fields: [
            {
              name: "Keywords",
              value: packageInfo.keywords?.map((e) => `\`${e}\``)?.join(", ") || "None",
            },
            // {
            //   name: "URL",
            //   value: `https://npmjs.com/package/${packageInfo.name}` || "None",
            // },
            {
              name: "Latest Version",
              value: packageInfo["dist-tags"].latest || "None",
              inline: true,
            },
            {
              name: "License",
              value: packageInfo.license || "None",
              inline: true,
            },
            {
              name: "Maintainers",
              value: packageInfo.maintainers?.map((m) => `\`${m.name}\``).join(", ") || "None",
            },
            {
              name: "Created at",
              value: new Date(packageInfo.time.created).toUTCString() || "Unknown",
              inline: true,
            },
            {
              name: "Updated at",
              value: new Date(packageInfo.time.modified).toUTCString() || "Unknown",
              inline: true,
            },
          ],
        },
      ],
    });
  }
}
