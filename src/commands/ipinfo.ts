/**
 * @file Slash command to get information about an IP Address.
 * @license Zlib
 */

import type { HibikiCommand } from "@/helpers/command.ts";
import { env } from "@/root/utils/env.ts";
import { HibikiColors } from "@/utils/constants.ts";
import { sendErrorReply } from "@/utils/error.ts";
import { hFetch } from "@/utils/fetch.ts";
import { t, tO } from "@/utils/i18n.ts";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { z } from "zod";

const abuseAPIBaseURL = "https://api.abuseipdb.com/api/v2/check?ipAddress=";

export const ipinfoCommand = {
  data: new SlashCommandBuilder()
    .setName("ipinfo")
    .setNameLocalizations(tO("commands:IPINFO_NAME"))
    .setDescription(t("commands:IPINFO_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:IPINFO_DESCRIPTION"))
    // Address option.
    .addStringOption((address) =>
      address
        .setName("address")
        .setNameLocalizations(tO("commands:IPINFO_ADDRESS_NAME"))
        .setDescription(t("commands:IPINFO_ADDRESS_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:IPINFO_ADDRESS_DESCRIPTION"))
        .setRequired(true),
    ),

  async run(interaction) {
    // Defers the reply.
    await interaction.deferReply();

    // Gets the query.
    const ipRegion: string[] = [];
    const query = interaction.options.getString("address", true);
    let ipAPIURL = "https://ipinfo.io";

    // Parses the query; do not request invalid IPs.
    if (!z.string().ip().safeParse(query).success) {
      await sendErrorReply(interaction, "errors:IPINFO_INVALID", true, true);
      return;
    }

    // IPV6 support. Adjusts the URL to be v6.ipinfo.io.
    if (z.string().ip({ version: "v6" }).safeParse(query).success) {
      ipAPIURL = "https://v6.ipinfo.io";
    }

    // Fetches the IP information.
    const ipResponse = await hFetch(`${ipAPIURL}/${query}/json`, {
      headers: {
        Authorization: `Bearer ${env.IPINFO_API_KEY}`,
      },
    });

    // Error handler for invalid response.
    if (!ipResponse) {
      await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
      return;
    }

    // Converts IP information response to JSON.
    const ipBody: IPInfoResponse = await ipResponse.json();
    if (!ipBody) {
      await sendErrorReply(interaction, "errors:IPINFO_INVALID", true, true);
      return;
    }

    // Fetched AbuseIPDB information.
    const abuseResponse = await hFetch(`${abuseAPIBaseURL}${query}`, {
      headers: {
        Accept: "application/json",
        Key: env.ABUSEIPDB_API_KEY,
      },
    });

    // Error handler for invalid response.
    if (!abuseResponse) {
      await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
      return;
    }

    // Converts abuse information response to JSON.
    const abuseBody = await abuseResponse.json();

    // Creates the embed.
    const embed = new EmbedBuilder().setColor(HibikiColors.Primary).setAuthor({
      iconURL: interaction.client.user.displayAvatarURL(),
      name: query.toString(),
      url: `${ipAPIURL}/${query}`,
    });

    // Hostname.
    if (ipBody.hostname) {
      embed.addFields({
        name: t("commands:IPINFO_HOSTNAME", { lng: interaction.locale }),
        value: ipBody.hostname,
        inline: false,
      });
    }

    // ASN.
    if (ipBody.org) {
      embed.addFields({
        name: t("commands:IPINFO_ASN", { lng: interaction.locale }),
        value: ipBody.org,
        inline: false,
      });
    }

    // Geolocation.
    if (ipBody.loc) {
      embed.addFields({
        name: t("commands:IPINFO_GEOLOCATION", { lng: interaction.locale }),
        value: ipBody.loc,
        inline: true,
      });
    }

    // IP city.
    if (ipBody.city) {
      ipRegion.push(ipBody.city);
    }

    // IP region.
    if (ipBody.region) {
      ipRegion.push(ipBody.region);
    }

    // IP country.
    if (ipBody.country) {
      ipRegion.push(ipBody.country);
    }

    // IP postal code.
    if (ipBody.postal) {
      ipRegion.push(ipBody.postal);
    }

    // Joins the IP region string.
    const regionString = ipRegion.join(", ");

    // Region.
    if (regionString.length > 0) {
      embed.addFields({
        name: t("common:LOCATION", { lng: interaction.locale }),
        value: regionString,
        inline: true,
      });
    }

    // Timezone.
    if (ipBody.timezone) {
      embed.addFields({
        name: t("common:TIMEZONE", { lng: interaction.locale }),
        value: ipBody.timezone,
        inline: true,
      });
    }

    // Abuse information.
    if (!abuseBody.data?.errors) {
      // ISP.
      if (abuseBody.data.isp) {
        embed.addFields({
          name: t("commands:IPINFO_ISP", { lng: interaction.locale }),
          value: abuseBody.data.isp,
          inline: true,
        });
      }

      // Usage type.
      if (abuseBody.data.usageType) {
        embed.addFields({
          name: t("commands:IPINFO_USAGE_TYPE", { lng: interaction.locale }),
          value: abuseBody.data.usageType,
          inline: true,
        });
      }

      // Domain.
      if (abuseBody.data.domain) {
        embed.addFields({
          name: t("commands:IPINFO_DOMAIN", { lng: interaction.locale }),
          value: abuseBody.data.domain,
          inline: true,
        });
      }

      // Bogon/TOR.
      if (ipBody.bogon || abuseBody.data.tor) {
        embed.addFields({
          name: t("commands:IPINFO_NOTES", { lng: interaction.locale }),
          value: t(
            ipBody.bogon ? "commands:IPINFO_BOGON" : "commands:IPINFO_TOR",
            {
              lng: interaction.locale,
            },
          ),
          inline: false,
        });
      }

      // Total reports.
      embed.addFields({
        name: t("commands:IPINFO_ABUSE_INFORMATION", {
          lng: interaction.locale,
        }),
        value: t("commands:IPINFO_ABUSE_STATISTICS", {
          lng: interaction.locale,
          reports: abuseBody.data.totalReports,
          confidence: abuseBody.data.abuseConfidenceScore,
        }),
        inline: false,
      });
    }

    // Sends the interaction.
    await interaction.followUp({ embeds: [embed] });
  },
} satisfies HibikiCommand;

/**
 * Possible IPInfo.IO API response.
 * @see https://ipinfo.io/developers#json-response.
 */

type IPInfoResponse = {
  anycast?: boolean;
  bogon?: boolean;
  city?: string;
  country?: string;
  hostname?: string;
  ip: string;
  loc?: string;
  org?: string;
  postal?: string;
  readme?: string;
  region?: string;
  timezone?: string;
};
