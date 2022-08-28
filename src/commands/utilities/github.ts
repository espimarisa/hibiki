import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { HibikiCommand } from "../../classes/Command.js";
import fetch from "../../utils/fetch.js";
import { createFullTimestamp } from "../../utils/timestamp.js";
import { APIApplicationCommandOption, ApplicationCommandOptionType } from "discord-api-types/v10";

export class GithubCommand extends HibikiCommand {
  description = "Returns information about a Github user, organization, or repository";

  options: APIApplicationCommandOption[] = [
    {
      name: "query",
      description: "The user, organization, or repository to return information about. Ex: sysdotini/hibiki",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async runWithInteraction(interaction: ChatInputCommandInteraction) {
    // Gets the query
    const query = interaction.options.getString(this.options[0].name);

    if (!query) {
      await interaction.followUp({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_GITHUB_NO_RESULTS"),
            color: this.bot.config.colours.error,
          },
        ],
      });

      return;
    }

    // Searches for a repository
    if (query.includes("/")) {
      const response = await fetch(`https://api.github.com/repos/${query}`);
      const data = await response.json();

      // If nothing is found
      if (!response || !data?.id || data?.message) {
        return;
      }

      // Embed fields
      const fields: EmbedField[] = [];
      const dates: EmbedField[] = [];

      // Creation date
      if (data.created_at) {
        dates.push({
          name: interaction.getString("utility.CREATED_AT"),
          value: createFullTimestamp(data.created_at),
          inline: false,
        });
      }

      // Last update
      if (data.updated_at) {
        dates.push({
          name: interaction.getString("utility.UPDATED_AT"),
          value: createFullTimestamp(data.updated_at),
          inline: false,
        });
      }

      // Last push
      if (data.pushed_at) {
        dates.push({
          name: interaction.getString("utility.GITHUB_LASTPUSH"),
          value: createFullTimestamp(data.pushed_at),
          inline: false,
        });
      }

      // Timestamps
      if (dates.length > 0) {
        fields.push({
          name: interaction.getString("utility.GITHUB_REPOSITORY"),
          value: dates.map((d) => `${d.name} ${d.value}`).join("\n"),
          inline: false,
        });
      }

      // Owner info
      if (data.owner?.login && !data.source) {
        fields.push({
          name: interaction.getString("global.OWNER"),
          value: data.owner.login,
          inline: true,
        });
      }

      // If it's a fork
      if (data.fork && data.source?.full_name) {
        fields.push({
          name: interaction.getString("global.OWNER"),
          value: interaction.getString("utility.GITHUB_FORKED_FROM", { repo: data.source?.full_name }),
          inline: true,
        });
      }

      // Primary language
      if (data.language) {
        fields.push({
          name: interaction.getString("utility.GITHUB_LANGUAGE"),
          value: `${data.language}`,
          inline: true,
        });
      }

      // License
      if (data.license?.spdx_id && data.license?.spdx_id !== "NOASSERTION")
        fields.push({
          name: interaction.getString("utility.LICENSE"),
          value: `${data.license.spdx_id}`,
          inline: true,
        });

      // Total stars
      if (data.stargazers_count > 0) {
        fields.push({
          name: interaction.getString("utility.GITHUB_STARS"),
          value: `${data.stargazers_count}`,
          inline: true,
        });
      }

      // Total watchers
      if (data.subscribers_count > 0) {
        fields.push({
          name: interaction.getString("utility.GITHUB_WATCHING"),
          value: `${data.subscribers_count}`,
          inline: true,
        });
      }

      // Issues open
      if (data.open_issues > 0) {
        fields.push({
          name: interaction.getString("utility.GITHUB_ISSUES"),
          value: `${data.open_issues}`,
          inline: true,
        });
      }

      // Total forks
      if (data.forks > 0) {
        fields.push({
          name: interaction.getString("utility.GITHUB_FORKS"),
          value: `${data.forks}`,
          inline: true,
        });
      }

      // Homepage
      if (data.homepage) {
        fields.push({
          name: interaction.getString("utility.HOMEPAGE"),
          value: `${data.homepage}`,
          inline: true,
        });
      }

      await interaction.followUp({
        embeds: [
          {
            title: data.full_name,
            url: data.html_url,
            description: data.description,
            color: this.bot.config.colours.primary,
            fields: fields,
            thumbnail: {
              url: data.owner.avatar_url,
            },
          },
        ],
      });
    }
  }
}
