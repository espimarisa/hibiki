const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class twitterCommand extends Command {
  constructor(...args) {
    super(...args, {
      aliases: "<account:string>",
      args: "<query:string>",
      description: "Returns information from Wikipedia",
      cooldown: 3
    });
  }

  async run(msg, args) {
    // Fetches the API
    let res = await fetch(`https://api.twitter.com/1.1/users/show.json?screen_name=${encodeURIComponent(args)}`, {
      // Sets the required headers
      headers: { "Authorization": `Bearer ${this.bot.key.twitter}`, "User-Agent": "Hibiki", }
    });

    let body = await res.json().catch(() => {});
    // Sends if the body encounters an error
    if (!body) return msg.channel.createMessage("❌ Error", "Account not found.")
    if (body.errors && body.errors[0].code === 215) return msg.channel.createMessage(this.bot.embed("❌ Error", "Unauthorised to access the Twitter API.", "error"))
    if (body.errors && body.errors[0].code === 403) return msg.channel.createMessage(this.bot.embed("❌ Error", "Couldn't return info. Try again later.", "error"))
    if (body.errors && body.errors[0].code === 50) return msg.channel.createMessage(this.bot.embed("❌ Error", "Account not found.", "error"))
    if (body.errors && body.errors[0].code === 63) return msg.channel.createMessage(this.bot.embed("❌ Error", "This user has been suspended.", "error"));

    // Sets the fields
    let fields = [];
    if (body.statuses_count) fields.push({ name: "Tweets", value: `${body.statuses_count === 0 ? "No tweets" : body.statuses_count}`, inline: true, });
    if (body.favourites_count) fields.push({ name: "Likes", value: `${body.favourites_count === 0 ? "None" : body.favourites_count}`, inline: true, });
    if (body.followers_count) fields.push({ name: "Followers", value: `${body.followers_count === 0 ? "None" : body.followers_count}`, inline: true, });
    if (body.friends_count) fields.push({ name: "Following", value: `${body.friends_count === 0 ? "Nobody" : body.friends_count}`, inline: true, });
    if (body.location) fields.push({ name: "Location", value: `${body.location || "No location"}`, inline: true, });
    if (body.url) fields.push({ name: "Website", value: `[Website](${body.url})`, inline: true, });
    // Verified and private
    if (body.protected === true && body.verified === true) fields.push({ name: "Notes", value: "This account is private and verified.", });
    // Verified and not private
    if (body.verified === true && body.protected === false) fields.push({ name: "Notes", value: "This account is verified.", });
    // Private and not verified
    if (body.protected === true && body.verified === false) fields.push({ name: "Notes", value: "This account is private.", });
    if (body.status) fields.push({ name: "Latest Tweet", value: body.status.text, });
    // Sets the embed construct
    let construct = {
      title: `🐦 ${body.name || "Unknown"} (@${body.screen_name})`,
      color: this.bot.embed.colour("general"),
      fields: fields,
      thumbnail: {
        url: `https://avatars.io/twitter/${body.screen_name || null}`,
      },
    };

    // Sets the image if the user has a banner
    if (body.profile_banner_url) construct.image = { url: body.profile_banner_url };
    // Sets the description as the user's bio
    if (body.description) construct.description = body.description;

    // Sends the embed construct
    await msg.channel.createMessage({
      embed: construct,
    });
  }
}

module.exports = twitterCommand;
