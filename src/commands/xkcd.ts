/**
 * @file Slash command to send a specific or random XKCD comic.
 * @author Espi Marisa <contact@espi.me>
 * @license zlib
 */

import { AllInteractionContextTypes, HibikiColors } from "@/utils/constants.js";
import { sendErrorReply } from "@/utils/error.js";
import { hFetch } from "@/utils/fetch.js";
import { tObj } from "@/utils/i18n.js";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { t } from "i18next";

// TODO: Allow searching by title and transcripts!
// XKCD Comic response - https://xkcd.com/info.0.json
type XKCDResponse = {
  title: string;
  safe_title: string;
  alt: string;
  img: string;
  num: number;
  day: number;
  month: number;
  year: number;
  transcript?: string;
  news?: string;
  link?: string;
};

export const xkcdCommand: HibikiSlashCommand = {
  defer: true,
  data: new SlashCommandBuilder()
    .setName("xkcd")
    .setNameLocalizations(tObj("commands:XKCD_NAME"))
    .setDescription(t("commands:XKCD_DESCRIPTION"))
    .setDescriptionLocalizations(tObj("commands:XKCD_DESCRIPTION"))
    .setContexts(AllInteractionContextTypes)
    // Number option
    .addIntegerOption((number) =>
      number
        .setName("number")
        .setNameLocalizations(tObj("commands:XKCD_NUMBER_NAME"))
        .setDescription(t("commands:XKCD_NUMBER_DESCRIPTION"))
        .setDescriptionLocalizations(tObj("commands:XKCD_NUMBER_DESCRIPTION"))
        .setRequired(false),
    ),

  async runCommand(interaction) {
    // Gets the number and/or endpoint to use
    const number = interaction.options.getInteger("number");
    let endpoint = number
      ? `https://xkcd.com/${number}/info.0.json`
      : "https://xkcd.com/info.0.json";

    // Gets the specific comic or the latest one to calculate how many XKCD comics are available
    let response = await hFetch(endpoint);

    // Sends a generic error if no response
    if (!response || response.status === 404) {
      await sendErrorReply(
        interaction,
        response?.status === 404 ? "errors:XKCD" : "errors:IMAGE_FAILED",
        true,
        true,
      );

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

      // Sends a generic error if no response; otherwise throw 404
      if (!response || response.status === 404) {
        await sendErrorReply(
          interaction,
          response?.status === 404 ? "errors:XKCD" : "errors:IMAGE_FAILED",
          true,
          true,
        );

        return;
      }

      // Gets the body; throw 404 if not found
      body = await response.json();
      if (!body?.num) {
        await sendErrorReply(interaction, "errors:XKCD", true, true);
        return;
      }
    }

    // Sends the embed
    await interaction.followUp({
      embeds: [
        new EmbedBuilder()
          .setTitle(`${body.safe_title} (#${body.num})`)
          .setDescription(
            body.alt.length > 2000
              ? `${body.alt.substring(0, 1500)}...`
              : body.alt,
          )
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
};
