import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import axios from "axios";

export class IPInfoCommand extends Command {
  description = "Returns info about an IP address.";
  requiredkeys = ["ipinfo"];
  args = "<ip:string>";
  aliases = ["aboutip", "geolocation", "ip", "ipinformation"];
  cooldown = 3000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const query = encodeURIComponent(args.join(" "));
    const body = await axios
      .get(`https://ipinfo.io/${query}/json?token=${encodeURIComponent(this.bot.config.keys.ipinfo)}`)
      .catch(() => {});

    const abuseinfo = await axios
      .get(`https://api.abuseipdb.com/api/v2/check?ipAddress=${query}`, {
        headers: {
          "Key": encodeURIComponent(this.bot.config.keys.abuseipdb),
          "Accept": "application/json",
          "User-Agent": "hibiki",
        },
      })
      .catch(() => {});

    // If nothing is found
    if (!body || !body.data || body.data.error || !body.data.ip || !body.data.org) {
      return msg.createEmbed(msg.locale("global.ERROR"), msg.locale("utility.IPINFO_INVALID"), "error");
    }

    // Embed fields
    const fields: EmbedField[] = [];

    // Region/city/country string
    let regionString = "";
    if (body.data.country) regionString = body.data.country;
    if (body.data.country && body.data.region) regionString = `${body.data.region}, ${body.data.country}`;
    if (body.data.city && body.data.region && body.data.country) {
      regionString = `${body.data.city}, ${body.data.region}, ${body.data.country}`;
    }

    // Hostname
    if (body.data.hostname) {
      fields.push({
        name: msg.locale("utility.IPINFO_HOSTNAME"),
        value: body.data.hostname,
        inline: true,
      });
    }

    // Org
    if (body.data.org) {
      fields.push({
        name: msg.locale("utility.IPINFO_ORG"),
        value: body.data.org,
        inline: true,
      });
    }

    // Geolocation
    if (body.data.loc) {
      fields.push({
        name: msg.locale("utility.IPINFO_GEOLOCATION"),
        value: body.data.loc,
        inline: true,
      });
    }

    // Region
    if (regionString) {
      fields.push({
        name: msg.locale("utility.LOCATION"),
        value: `${regionString}`,
        inline: false,
      });
    }

    // AbuseIPDB info
    if (abuseinfo && abuseinfo.data?.data) {
      if (!abuseinfo.data.data.errors) {
        fields.push({
          name: msg.locale("utility.IPINFO_ABUSEINFO"),
          value: msg.locale("utility.IPINFO_ABUSEDATA", {
            reports: abuseinfo.data.data.totalReports,
            confidence: abuseinfo.data.data.abuseConfidenceScore,
          }),
        });
      }
    }

    // Maps image
    let image: string;
    if (body.data.loc && this.bot.config.keys.maps) {
      image = `https://maps.googleapis.com/maps/api/staticmap?center=${body.data.loc}&zoom=10&size=250x150&sensor=false&key=${this.bot.config.keys.maps}`;
    }

    // Sends ip information
    msg.channel.createMessage({
      embed: {
        title: `🌐 ${body.data.ip}`,
        description: msg.locale("utility.IPINFO_DESCRIPTION"),
        color: msg.convertHex("general"),
        image: {
          url: image || "",
        },
        fields: fields,
        footer: {
          text: msg.locale("global.RAN_BY", {
            author: msg.tagUser(msg.author),
            poweredBy: "ipinfo.io",
          }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
