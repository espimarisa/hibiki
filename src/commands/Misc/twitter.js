const Command = require("../../lib/structures/Command");
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
    // Fetches the API
    const body = await fetch(`https://api.twitter.com/1.1/users/show.json?screen_name=${encodeURIComponent(args)}`, {
      headers: { "Authorization": `Bearer ${this.bot.key.twitter}`, "User-Agent": `${this.bot.user.username}/${this.bot.version}` },
    }).then(async res => await res.json().catch(() => {}));

    // Errors
    if (!body) return msg.channel.createMessage("❌ Error", "Account not found.");
    if (body.errors) {
      if (body.errors[0].code === 215) return msg.channel.createMessage(this.bot.embed("❌ Error", "Unauthorized to access the Twitter API.", "error"));
      if (body.errors[0].code === 403) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't return any info. Try again later.", "error"));
      if (body.errors[0].code === 50) return msg.channel.createMessage(this.bot.embed("❌ Error", "Account not found.", "error"));
      if (body.errors[0].code === 63) return msg.channel.createMessage(this.bot.embed("❌ Error", "This user has been suspended.", "error"));
    }

    // Sets the fields
    const fields = [];
    if (body.statuses_count) fields.push({ name: "Tweets", value: `${body.statuses_count === 0 ? "No tweets" : body.statuses_count}`, inline: true });
    if (body.favourites_count) fields.push({ name: "Likes", value: `${body.favourites_count === 0 ? "None" : body.favourites_count}`, inline: true });
    if (body.followers_count) fields.push({ name: "Followers", value: `${body.followers_count === 0 ? "None" : body.followers_count}`, inline: true });
    if (body.friends_count) fields.push({ name: "Following", value: `${body.friends_count === 0 ? "Nobody" : body.friends_count}`, inline: true });
    if (body.location) fields.push({ name: "Location", value: `${body.location || "No location"}`, inline: true });
    if (body.url) fields.push({ name: "Website", value: `[Website](${body.url})`, inline: true });
    if (body.protected && body.verified) fields.push({ name: "Notes", value: "This account is private and verified." });
    if (body.verified && !body.protected) fields.push({ name: "Notes", value: "This account is verified." });
    if (body.protected && !body.verified) fields.push({ name: "Notes", value: "This account is private." });
    if (body.status) fields.push({ name: "Latest Tweet", value: body.status.text });

    // Sets the embed construct
    const construct = {
      title: `🐦 ${body.name || "Unknown"} (@${body.screen_name})`,
      color: this.bot.embed.color("general"),
      fields: fields,
      thumbnail: {
        url: `${body.profile_image_url_https || null}`,
      },
    };

    // Banner & bio
    if (body.profile_banner_url) construct.image = { url: body.profile_banner_url };
    if (body.description) construct.description = body.description;

    // Sends the embed construct
    await msg.channel.createMessage({
      embed: construct,
    });
  }
}

module.exports = twitterCommand;
