const Command = require("../../lib/structures/Command");
const fetch = require("node-fetch");

class ipinfoCommand extends Command {
  constructor(...args) {
    super(...args, {
      args: "<ip:string>",
      aliases: ["aboutip", "geolocation", "ip", "ipinformation"],
      description: "Returns info about an IP address.",
      cooldown: 3,
    });
  }

  async run(msg, args) {
    // Fetches the API
    if (!this.bot.key.ipinfo) return msg.channel.createMessage(this.bot.embed("❌ Error", "Unauthorized - no API key provided.", "error"));
    let res = await fetch(`https://ipinfo.io/${encodeURIComponent(args.join(" "))}/json?token=${encodeURIComponent(this.bot.key.ipinfo)}`);
    let body = await res.json();

    // Fetches IP Abuse DB
    let ipdb = await fetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(args.join(" "))}`, { headers: { Key: this.bot.key.abuseipdb, Accept: "application/json" } });
    let abuseinfo = await ipdb.json();
    if (body.error || !body.ip) return msg.channel.createMessage(this.bot.embed("❌ Error", "Either that IP is invalid or nothing was found.", "error"));

    // Sets the fields
    let fields = [];
    if (body.hostname) fields.push({ name: "Hostname", value: body.hostname, inline: true, });
    if (body.org) fields.push({ name: "Org", value: body.org, inline: true, });
    if (body.loc) fields.push({ name: "Location", value: body.loc, inline: true, });
    if (body.country) fields.push({ name: "Country", value: body.country, inline: true, });
    if (body.city) fields.push({ name: "City", value: body.city, inline: true, });
    if (body.region) fields.push({ name: "Region", value: body.region, inline: true, });
    if (!abuseinfo.errors) fields.push({ name: "Abuse Info", value: `${abuseinfo.data.totalReports} reports, ${abuseinfo.data.abuseConfidenceScore}/100 abuse score`, });

    // Sets the construct
    let construct = {
      title: `🌐 ${body.ip}`,
      description: "Information may be slightly innacurate.",
      color: this.bot.embed.colour("general"),
      fields: fields,
    };

    // Google maps IP geolocation
    if (body.loc && this.bot.key.maps) construct.image = { url: `https://maps.googleapis.com/maps/api/staticmap?center=${body.loc}&zoom=10&size=250x150&sensor=false&key=${this.bot.key.maps}` };
    // Sends the embed
    await msg.channel.createMessage({
      embed: construct,
    });
  }
}

module.exports = ipinfoCommand;
