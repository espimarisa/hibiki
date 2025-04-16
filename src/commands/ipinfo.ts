/**
 * @file Slash command to get information about an IP Address.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { AllInteractionContextTypes } from "@/utils/constants.js";
import { env } from "@/utils/env.js";
import { sendErrorReply } from "@/utils/error.js";
import { hFetch } from "@/utils/fetch.js";
import { t, tO } from "@/utils/i18n.js";
import { SlashCommandBuilder } from "discord.js";
import { z } from "zod";

export const ipinfoCommand: HibikiSlashCommand = {
  defer: true,
  required_env: ["IPINFO_API_KEY"],
  data: new SlashCommandBuilder()
    .setName("ipinfo")
    .setNameLocalizations(tO("commands:IPINFO_NAME"))
    .setDescription(t("commands:IPINFO_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:IPINFO_DESCRIPTION"))
    .setContexts(AllInteractionContextTypes)
    // Address option
    .addStringOption((address) =>
      address
        .setName("address")
        .setNameLocalizations(tO("commands:IPINFO_ADDRESS_NAME"))
        .setDescription(t("commands:IPINFO_ADDRESS_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:IPINFO_ADDRESS_DESCRIPTION"))
        .setRequired(true),
    ),

  async runCommand(interaction) {
    // Gets the query
    const query = interaction.options.getString("address", true);
    let apiURL = "https://ipinfo.io";

    // Parses the query; do not request invalid IPs
    if (!z.string().ip().safeParse(query).success) {
      await sendErrorReply(interaction, "errors:IPINFO_INVALID", true, true);
      return;
    }

    // IPV6 support. Adjusts the URL to be v6.ipinfo.io.
    if (z.string().ip({ version: "v6" }).safeParse(query).success) {
      apiURL = "https://v6.ipinfo.io";
    }

    // Fetches the IP information
    const response = await hFetch(`${apiURL}/${query}/json`, {
      headers: {
        Authorization: `Bearer ${env.IPINFO_API_KEY}`,
      },
    });

    // Invalid response handler
    if (!response) {
      await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
      return;
    }

    // Converts response to JSON
    const body = await response.json();
    if (!body) {
      await sendErrorReply(interaction, "errors:IPINFO_INVALID", true, true);
      return;
    }
  },
};
