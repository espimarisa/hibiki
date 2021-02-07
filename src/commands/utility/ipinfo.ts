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
      return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.IPINFO_INVALID"), "error");
    }

    // Embed fields
    const fields: EmbedField[] = [];

    // Hostname
    if (body.data.hostname) {
      fields.push({
        name: msg.string("utility.IPINFO_HOSTNAME"),
        value: body.data.hostname,
        inline: true,
      });
    }

    // Org
    if (body.data.org) {
      fields.push({
        name: msg.string("utility.IPINFO_ORG"),
        value: body.data.org,
        inline: true,
      });
    }

    // Location
    if (body.data.loc) {
      fields.push({
        name: msg.string("utility.LOCATION"),
        value: body.data.loc,
        inline: true,
      });
    }

    // Country
    if (body.data.country) {
      fields.push({
        name: msg.string("utility.IPINFO_COUNTRY"),
        value: body.data.country,
        inline: true,
      });
    }

    // City
    if (body.data.city) {
      fields.push({
        name: msg.string("utility.IPINFO_CITY"),
        value: body.data.city,
        inline: true,
      });
    }

    // Region
    if (body.data.region) {
      fields.push({
        name: msg.string("global.REGION"),
        value: body.data.region,
        inline: true,
      });
    }

    // AbuseIPDB info
    if (abuseinfo && abuseinfo.data?.data) {
      if (!abuseinfo.data.data.errors) {
        fields.push({
          name: "Abuse Info",
          value: `${abuseinfo.data.data.totalReports} reports; ${abuseinfo.data.data.abuseConfidenceScore}% confidence`,
        });
      }
    }

    // Maps image
    let image: string;
    if (body.data.loc && this.bot.config.keys.maps) {
      image = `https://maps.googleapis.com/maps/api/staticmap?center=${body.data.loc}&zoom=10&size=250x150&sensor=false&key=${this.bot.config.keys.maps}`;
    }

    console.log(image);

    msg.channel.createMessage({
      embed: {
        title: `🌐 ${body.data.ip}`,
        description: msg.string("utility.IPINFO_DESCRIPTION"),
        color: msg.convertHex("general"),
        image: {
          url: image || "",
        },
        fields: fields,
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
