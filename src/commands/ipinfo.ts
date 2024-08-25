import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { type API_KEYS, env } from "$utils/env.ts";
import { hibikiFetch } from "$utils/fetch.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction, EmbedField } from "discord.js";
import { t } from "i18next";
import { z } from "zod";

export class IPInfoCommand extends HibikiCommand {
  requiredAPIKeys: API_KEYS[] = ["API_ABUSEIPDB_KEY", "API_IPINFOIO_KEY", "API_GOOGLEMAPS_KEY"];

  options: HibikiCommandOptions[] = [
    {
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  public async runCommand(interaction: ChatInputCommandInteraction) {
    const query = interaction.options.getString((this.options as APIOption[])[0]!.name, true);
    const fields: EmbedField[] = [];
    let IPINFO_API_BASE_URL = "https://ipinfo.io";
    let ipv6 = false;

    // Error handler
    const errorMessage = async (ipv6 = false) => {
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: ipv6
              ? t("commands:COMMAND_IPINFO_INVALID_IPV6", { lng: interaction.locale })
              : t("commands:COMMAND_IPINFO_INVALID", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });
    };

    // Error handler for invalid IPs
    if (!z.string().ip().safeParse(query).success) {
      await errorMessage();
      return;
    }

    // IPV6 support. Set IPV6 to true for networking errors
    if (z.string().ip({ version: "v6" }).safeParse(query).success) {
      ipv6 = true;
      IPINFO_API_BASE_URL = "https://v6.ipinfo.io";
    }

    // Gets the IP information
    const ipinfoResponse = await hibikiFetch(`${IPINFO_API_BASE_URL}/${query}/json`, {
      headers: {
        Authorization: `Bearer ${env.API_IPINFOIO_KEY}`,
      },
    });

    // Converts response; error handler
    const ipinfoBody = await ipinfoResponse?.json();
    if (!ipinfoResponse && ipinfoBody) {
      await errorMessage(ipv6);
      return;
    }

    // Gets AbuseIPDB information
    const abuseipdbResponse = await hibikiFetch(`https://api.abuseipdb.com/api/v2/check?ipAddress=${query}`, {
      headers: {
        Key: env.API_ABUSEIPDB_KEY,
        Accept: "application/json",
      } as HeadersInit,
    });

    // Converts response for abuseIPDB
    const abuseipdbBody = await abuseipdbResponse?.json();

    // Hostname
    if (ipinfoBody.hostname) {
      fields.push({
        name: t("commands:COMMAND_IPINFO_HOSTNAME", { lng: interaction.locale }),
        value: ipinfoBody.hostname,
        inline: true,
      });
    }

    // ORG/ASN
    if (ipinfoBody.org) {
      fields.push({
        name: t("commands:COMMAND_IPINFO_ASN", { lng: interaction.locale }),
        value: ipinfoBody.org.toString(),
        inline: true,
      });
    }

    // Google Maps tile
    let mapTile = "";
    if (ipinfoBody.loc) {
      // Sets the map tile
      mapTile = `https://maps.googleapis.com/maps/api/staticmap?center=${ipinfoBody.loc}&zoom=10&size=250x150&scale=2&key=${env.API_GOOGLEMAPS_KEY}`;
    }

    // Region/city/country string
    let regionString = "";

    // Country only parsing
    if (ipinfoBody.country) {
      regionString = ipinfoBody.country;
    }

    // Country + region parsing
    if (ipinfoBody.country && ipinfoBody.region) {
      regionString = `${ipinfoBody.region}, ${ipinfoBody.country}`;
    }

    // City, region, and country parsing
    if (ipinfoBody.city && ipinfoBody.region && ipinfoBody.country) {
      regionString = `${ipinfoBody.city}, ${ipinfoBody.region}, ${ipinfoBody.country}`;
    }

    // City, region, country, and postal parsing
    if (ipinfoBody.city && ipinfoBody.region && ipinfoBody.country && ipinfoBody.postal) {
      regionString = `${ipinfoBody.city}, ${ipinfoBody.region}, ${ipinfoBody.country}, ${ipinfoBody.postal}`;
    }

    // Region data
    if (regionString) {
      fields.push({
        name: t("global:LOCATION", { lng: interaction.locale }),
        value: regionString,
        inline: false,
      });
    }

    if (ipinfoBody.timezone) {
      fields.push({
        name: t("global:TIMEZONE", { lng: interaction.locale }),
        value: ipinfoBody.timezone.toString(),
        inline: false,
      });
    }

    // AbuseIPDB information
    if (!abuseipdbBody.data?.errors) {
      // Usage type
      if (abuseipdbBody.data.usageType) {
        fields.push({
          name: t("commands:COMMAND_IPINFO_USAGETYPE", { lng: interaction.locale }),
          value: abuseipdbBody.data.usageType,
          inline: true,
        });
      }

      // Domain
      if (abuseipdbBody.data.domain) {
        fields.push({
          name: t("commands:COMMAND_IPINFO_DOMAIN", { lng: interaction.locale }),
          value: abuseipdbBody.data.domain.toString(),
          inline: true,
        });
      }

      // ISP
      if (abuseipdbBody.data.isp) {
        fields.push({
          name: t("commands:COMMAND_IPINFO_ISP", { lng: interaction.locale }),
          value: abuseipdbBody.data.isp,
          inline: false,
        });
      }

      // Total reports
      fields.push({
        name: t("commands:COMMAND_IPINFO_ABUSESTATS", { lng: interaction.locale }),
        value: t("commands:COMMAND_IPINFO_ABUSESTATS_DATA", {
          lng: interaction.locale,
          reports: abuseipdbBody.data.totalReports,
          confidence: abuseipdbBody.data.abuseConfidenceScore,
        }),
        inline: true,
      });

      // Tor
      if (abuseipdbBody.data.isTor) {
        fields.push({
          name: t("commands:COMMAND_IPINFO_TOR", { lng: interaction.locale }),
          value: t("booleans:YES", { lng: interaction.locale }),
          inline: true,
        });
      }
    }

    // Sends the embed
    await interaction.followUp({
      embeds: [
        {
          color: HibikiColors.GENERAL,
          fields: fields,
          author: {
            icon_url: interaction.client.user.displayAvatarURL(),
            name: t("commands:COMMAND_IPINFO_INFOFOR", { lng: interaction.locale, ip: query }),
            url: `https://ipinfo.io/${query}`,
          },
          image: {
            url: mapTile,
          },
        },
      ],
    });
  }
}
