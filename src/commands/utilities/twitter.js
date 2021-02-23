const Command = require("../../structures/Command");
const fetch = require("node-fetch");

class twitterCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ["twit"],
      args: "<account:string>",
      description: "Returns info about a Twitter account.",
      requiredkeys: ["twitter"],
      cooldown: 3,
    });
  }

  async run(msg, args) {
    const body = await fetch(`https://api.twitter.com/1.1/users/show.json?screen_name=${encodeURIComponent(args)}`, {
      headers: {
        "Authorization": `Bearer ${this.bot.key.twitter}`,
        "User-Agent": `${this.bot.user.username}/${this.bot.version}`,
      },
    }).then(res => res.json().catch(() => {}));

    if (!body) return this.bot.embed("❌ Error", "Account not found.", msg, "error");

    if (body.errors) {
      if (body.errors[0].code === 215) return this.bot.embed("❌ Error", "Unauthorized. Try again later.", msg, "error");
      if (body.errors[0].code === 403) return this.bot.embed("❌ Error", "Couldn't find any info. Try again later.", msg, "error");
      if (body.errors[0].code === 50) return this.bot.embed("❌ Error", "Account not found.", msg, "error");
      if (body.errors[0].code === 63) return this.bot.embed("❌ Error", "Account has been suspended.", msg, "error");
    }

    const fields = [];
    if (body.statuses_count) fields.push({
      name: "Tweets",
      value: `${body.statuses_count === 0 ? "No tweets" : body.statuses_count}`,
      inline: true,
    });

    if (body.favourites_count) fields.push({
      name: "Likes",
      value: `${body.favourites_count === 0 ? "None" : body.favourites_count}`,
      inline: true,
    });

    if (body.followers_count) fields.push({
      name: "Followers",
      value: `${body.followers_count === 0 ? "None" : body.followers_count}`,
      inline: true,
    });

    if (body.friends_count) {
      fields.push({
        name: "Following",
        value: `${body.friends_count === 0 ? "Nobody" : body.friends_count}`,
        inline: true,
      });
    }

    if (body.location) fields.push({
      name: "Location",
      value: `${body.location}`,
      inline: true,
    });

    if (body.url) fields.push({
      name: "Website",
      value: `[Website](${body.url})`,
      inline: true,
    });

    if (body.protected && body.verified) fields.push({
      name: "Notes",
      value: "This account is private and verified.",
    });

    if (body.verified && !body.protected) fields.push({
      name: "Notes",
      value: "This account is verified.",
    });

    if (body.protected && !body.verified) fields.push({
      name: "Notes",
      value: "This account is private.",
    });

    if (body.status) fields.push({
      name: "Latest Tweet",
      value: body.status.text,
    });

    const construct = {
      color: 0x00ACED,
      fields: fields,
      author: {
        name: `${body.name} (@${body.screen_name})`,
        icon_url: `${body.profile_image_url_https}`,
        url: `https://twitter.com/${body.screen_name}`,
      },
      thumbnail: {
        url: `${body.profile_image_url_https || null}`,
      },
      footer: {
        text: `Ran by ${this.bot.tag(msg.author)}`,
        icon_url: msg.author.dynamicAvatarURL(),
      },
    };

    if (body.profile_banner_url) construct.image = { url: body.profile_banner_url };
    if (body.description) construct.description = body.description;

    msg.channel.createMessage({
      embed: construct,
    });
  }
}

module.exports = twitterCommand;
