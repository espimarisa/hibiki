import type { CommandInteraction } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";
import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v9";
export class GithubCommand extends HibikiCommand {
  description = "Fetches information about a Github repository";

  options: APIApplicationCommandOption[] = [
    {
      name: "repo",
      description: "Path to the repository you want to look up. Ex: sysdotini/hibiki",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
  ];
  public async runWithInteraction(interaction: CommandInteraction) {
    const repo = await interaction.options.getString("repo");
    if (!repo) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_GITHUB_NO_RESULTS"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }
    const data = await fetch(`https://api.github.com/repos/${repo}`);
    const repository: GithubRepository = await data.json();

    interaction.reply({
      embeds: [
        {
          title: repository.full_name,
          url: repository.html_url,
          description: repository.description,
          color: this.bot.config.colours.primary,
          thumbnail: {
            url: repository.owner.avatar_url,
          },
          fields: [
            {
              name: "Stars",
              value: repository.stargazers_count?.toString() || "0",
              inline: true,
            },
            {
              name: "Forks",
              value: repository.forks_count?.toString() || "0",
              inline: true,
            },
            {
              name: "Watchers",
              value: repository.subscribers_count?.toString() || "0",
              inline: true,
            },
            {
              name: "Open Issues",
              value: repository.open_issues_count?.toString() || "0",
              inline: true,
            },
            {
              name: "Primary language",
              value: repository.language || "Unknown",
              inline: true,
            },
            {
              name: "License",
              value: repository.license.name || "None",
              inline: true,
            },
          ],
          // thumbnail: {}
        },
      ],
    });
  }
}
