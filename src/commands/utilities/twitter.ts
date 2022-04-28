import type { CommandInteraction, EmbedField } from "discord.js";
import { HibikiCommand } from "../../classes/Command";
import fetch from "../../utils/fetch";
import { tagsToMarkdownLinks } from "../../utils/twitterparser";
import { ApplicationCommandOptionType, type APIApplicationCommandOption } from "discord-api-types/v9";

export class TwitterCommand extends HibikiCommand {
  description = "Returns information about a Twitter user.";
  options: APIApplicationCommandOption[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: "user",
      description: "The user to get information about.",
      required: true,
    },
  ];

  public async runWithInteraction(interaction: CommandInteraction) {
    // Get Twitter guest token
    const headers = {
      "Content-Type": "application/json",
      // "X-Twitter-Active-User": "yes",
      "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    };

    // Gets the raw member user info
    const req = await fetch(`https://api.twitter.com/1.1/users/lookup.json?screen_name=${interaction.options.getString("user")}`, {
      headers,
    });

    const users: TwitterUser[] = await req.json();

    const user = users[0];
    // Handler for if a member failed to fetch
    if (users.length === 0) {
      return interaction.reply({
        embeds: [
          {
            title: interaction.getString("global.ERROR"),
            description: interaction.getString("utilities.COMMAND_TWITTER_NO_RESULTS"),
            color: this.bot.config.colours.error,
          },
        ],
      });
    }

    const fields: EmbedField[] = [
      {
        name: "Followers",
        value: user.followers_count.toString(),
        inline: true,
      },
      {
        name: "Following",
        value: user.friends_count.toString(),
        inline: true,
      },
      {
        name: "Tweets",
        value: user.statuses_count.toString(),
        inline: true,
      },
    ];

    interaction.reply({
      embeds: [
        {
          title: `${user.name.toLowerCase() === user.screen_name.toLowerCase() ? `@${user.name}` : `${user.name} (@${user.screen_name})`} `,
          description: tagsToMarkdownLinks(user.description),
          color: ("#" + user.profile_link_color) as PrivateColorResolvable,
          fields: fields,
          thumbnail: {
            url: user.profile_image_url_https,
          },
          image: {
            url: user.profile_banner_url,
          },
          url: `https://twitter.com/${user.screen_name}`,
        },
      ],
    });
    // fields.push(
    //   {
    //     // ID
    //     name: interaction.getString("global.ID"),
    //     value: user.id_str,
    //     inline: false,
    //   },
    //   {

    //   },
    //   {
    //     // Account creation date
    //     name: interaction.getString("global.ACCOUNT_CREATED"),
    //     value: `${createFullTimestamp(user.created_at)}`,
    //     inline: false,
    //   },
    // );
  }
}
