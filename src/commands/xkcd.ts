/**
 * @file Slash command to send a specific or random XKCD comic.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import type { HibikiSlashCommand } from "@/helpers/command.js";
import { HibikiColors, MessageLimits } from "@/utils/constants.js";
import { sendErrorReply } from "@/utils/error.js";
import { hFetch } from "@/utils/fetch.js";
import { trimContent } from "@/utils/format.js";
import { tO } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

export const xkcdCommand = {
  data: new SlashCommandBuilder()
    .setName("xkcd")
    .setNameLocalizations(tO("commands:XKCD_NAME"))
    .setDescription(t("commands:XKCD_DESCRIPTION"))
    .setDescriptionLocalizations(tO("commands:XKCD_DESCRIPTION"))
    // Number option
    .addIntegerOption((number) =>
      number
        .setName("number")
        .setNameLocalizations(tO("commands:XKCD_NUMBER_NAME"))
        .setDescription(t("commands:XKCD_NUMBER_DESCRIPTION"))
        .setDescriptionLocalizations(tO("commands:XKCD_NUMBER_DESCRIPTION"))
        .setRequired(false),
    ),

  async run(interaction) {
    // Defers the reply
    await interaction.deferReply();

    // Gets the number and/or endpoint to use
    const number = interaction.options.getInteger("number");
    let endpoint = number
      ? `https://xkcd.com/${number}/info.0.json`
      : "https://xkcd.com/info.0.json";

    // Gets the specific comic or the latest one to calculate how many XKCD comics are available
    let response = await hFetch(endpoint);
    if (!response) {
      await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
      return;
    }

    // Error handler if the comic doesn't exist
    if (response.status === 404) {
      await sendErrorReply(interaction, "errors:XKCD", true, true);
      return;
    }

    // Gets the initial body; throw 404 if not found
    let body: XKCDResponse = await response.json();
    if (!body?.num) {
      await sendErrorReply(interaction, "errors:XKCD", true, true);
      return;
    }

    // Sets a random comic if a number isn't set
    if (!number) {
      // Calculates the random comic to get
      const randomNum = Math.floor(Math.random() * body.num) + 1;
      endpoint = `https://xkcd.com/${randomNum}/info.0.json`;

      // Gets the comic
      response = await hFetch(endpoint);
      if (!response) {
        await sendErrorReply(interaction, "errors:FETCH_FAILED", true, true);
        return;
      }

      // Error handler if the comic doesn't exist
      if (response.status === 404) {
        await sendErrorReply(interaction, "errors:XKCD", true, true);
        return;
      }

      // Gets the body; throw 404 if not found
      body = await response.json();
      if (!body?.num) {
        await sendErrorReply(interaction, "errors:XKCD", true, true);
        return;
      }
    }

    // Sends the interaction
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${body.safe_title} (#${body.num})`)
          .setDescription(trimContent(body.alt, MessageLimits.EmbedDescription))
          .setColor(HibikiColors.Primary)
          .setImage(body.img)
          .setFooter({
            iconURL: interaction.client.user.displayAvatarURL(),
            text: t("commands:XKCD_FOOTER", {
              lng: interaction.locale,
              date: `${body.day}/${body.month}/${body.year}`,
            }),
          }),
      ],
    });
  },
} satisfies HibikiSlashCommand;

/**
 * XKCD comic API response.
 * @see https://xkcd.com/info.0.json
 */

type XKCDResponse = {
  alt: string;
  day: number;
  img: string;
  link: string;
  month: number;
  news: string;
  num: number;
  safe_title: string;
  title: string;
  transcript: string;
  year: number;
};
