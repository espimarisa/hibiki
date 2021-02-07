import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class TwitterCommand extends Command {
  description = "Returns info about a Twitter profile.";
  requiredkeys = ["twitter"];
  args = "<account:string>";
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));
    const body = await axios
      .get(`https://api.twitter.com/1.1/users/show.json?screen_name=${query}`, {
        headers: {
          "Authorization": `Bearer ${this.bot.config.keys.twitter}`,
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {});

    if (!body || !body.data || body?.data?.errors) {
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");
    }

    // Embed fields
    const fields: EmbedField[] = [];

    // Total tweets
    if (body.data.statuses_count)
      fields.push({
        name: msg.string("utility.TWITTER_TWEETS"),
        value: `${body.data.statuses_count}`,
        inline: true,
      });

    // Total likes
    if (body.data.favourites_count)
      fields.push({
        name: msg.string("utility.TWITTER_LIKES"),
        value: `${body.data.favourites_count}`,
        inline: true,
      });

    // Total followers
    if (body.data.followers_count)
      fields.push({
        name: msg.string("utility.FOLLOWERS"),
        value: `${body.data.followers_count}`,
        inline: true,
      });

    // Total following
    if (body.data.friends_count) {
      fields.push({
        name: msg.string("utility.FOLLOWING"),
        value: `${body.data.friends_count}`,
        inline: true,
      });
    }

    // Location
    if (body.data.location)
      fields.push({
        name: msg.string("utility.LOCATION"),
        value: `${body.data.location}`,
        inline: true,
      });

    // Website
    if (body.data.url)
      fields.push({
        name: msg.string("utility.WEBSITE"),
        value: `[${msg.string("utility.WEBSITE")}](${body.data.url})`,
        inline: true,
      });

    // Private & verified
    if (body.data.protected && body.data.verified)
      fields.push({
        name: msg.string("utility.TWITTER_NOTES"),
        value: msg.string("utility.TWITTER_PRIVATEVERIFIED"),
        inline: false,
      });

    // Verified
    if (body.data.verified && !body.data.protected)
      fields.push({
        name: msg.string("utility.TWITTER_NOTES"),
        value: msg.string("utility.TWITTER_VERIFIED"),
        inline: false,
      });

    // Private
    if (body.data.protected && !body.data.verified)
      fields.push({
        name: msg.string("utility.TWITTER_NOTES"),
        value: msg.string("utility.TWITTER_PRIVATE"),
        inline: false,
      });

    // Latest tweet
    if (body.data.status)
      fields.push({
        name: msg.string("utility.TWITTER_LATESTTWEET"),
        value: body.data.status.text,
        inline: false,
      });

    // Sends account info
    msg.channel.createMessage({
      embed: {
        description: `${body.data.description || ""}`,
        color: 0x00aced,
        fields: fields,
        author: {
          name: `${body.data.name} (@${body.data.screen_name})`,
          icon_url: `${body.data.profile_image_url_https}`,
          url: `https://twitter.com/${body.data.screen_name}`,
        },
        thumbnail: {
          url: `${body.data.profile_image_url_https || ""}`,
        },
        image: {
          url: `${body.data.profile_banner_url || ""}`,
        },
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
