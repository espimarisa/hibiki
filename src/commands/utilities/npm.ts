import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import fetch from "../../utils/fetch.js";
import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

export class NpmCommand extends HibikiCommand {
  description = "Fetches information about a NPM package";

  options: APIApplicationCommandOption[] = [
    {
      name: "package",
      description: "Path to the package you want to look up. Ex: `discord.js` or `@discordjs/voice`",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];
  public async runWithInteraction(interaction: CommandInteraction) {
    const packageName = await interaction.options.getString("package");
    if (!packageName) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_NPM_NO_RESULTS"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }
    const data = await fetch(`https://registry.npmjs.com/${packageName}`);
    const packageInfo: NpmPackage = await data.json();

    interaction.reply({
      embeds: [
        {
          title: `:package: ${packageInfo.name}`,
          url: `https://npmjs.com/package/${packageInfo.name}`,
          description: packageInfo.description,
          // Technically, this shouldnt work and if it does well, fuck.
          color: "#CD0000" as PrivateColorResolvable,
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
