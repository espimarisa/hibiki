import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { hibikiFetch } from "$shared/fetch.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";

// XKCD Comic response - https://xkcd.com/info.0.json
interface XKCDResponse {
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
}

export class XKCDCommand extends HibikiCommand {
  options = [
    {
      // The XKCD number to get
      type: ApplicationCommandOptionType.Integer,
      required: false,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the number to lookup or if we should use the daily comic
    const number = interaction.options.getInteger((this.options as APIOption[])[0]!.name);
    let endpoint = number ? `https://xkcd.com/${number}/info.0.json` : "https://xkcd.com/info.0.json";

    // Error handler
    const errorMessage = async (notFound = false) => {
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: notFound
              ? t("commands:COMMAND_XKCD_NOTFOUND", { lng: interaction.locale })
              : t("errors:ERROR_IMAGE", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });
    };

    // Fetches the initial endpoint
    const initialRes = await hibikiFetch(endpoint);
    if (!initialRes || initialRes.status === 404) {
      await errorMessage(initialRes?.status === 404);
      return;
    }

    // Converts endpoint to JSON; error handler
    let body: XKCDResponse = await initialRes.json();
    if (!body?.num) {
      await errorMessage();
      return;
    }

    // Fetch a random comic if none is specified
    if (!number) {
      // Gets a random comic to fetch
      const randomNum = Math.floor(Math.random() * body.num) + 1;
      endpoint = `https://xkcd.com/${randomNum}/info.0.json`;

      // Fetches the random comic
      const randomRes = await hibikiFetch(endpoint);
      if (!randomRes || randomRes.status === 404) {
        await errorMessage(randomRes?.status === 404);
        return;
      }

      // Converts the random comic to JSON
      const randomBody: XKCDResponse = await randomRes.json();
      if (!randomBody?.num) {
        await errorMessage();
        return;
      }

      // Gets the final response
      const res = await hibikiFetch(endpoint);
      if (!res || res.status === 404) {
        await errorMessage(res?.status === 404);
        return;
      }

      // Gets the final body
      body = (await res.json()) as XKCDResponse;
      if (!body?.num) {
        await errorMessage();
        return;
      }
    }

    // Sends the image
    await interaction.followUp({
      embeds: [
        {
          title: `📰 ${body.safe_title} (#${body.num})`,
          description: body.alt.length > 2000 ? `${body.alt.substring(0, 1500)}...` : body.alt,
          color: HibikiColors.GENERAL,
          image: {
            url: body.img,
          },
          footer: {
            text: t("commands:COMMAND_XKCD_FOOTER", {
              lng: interaction.locale,
              url: "xkcd.com",
              date: `${body.month}/${body.day}/${body.year}`,
            }),
            icon_url: this.bot.user?.displayAvatarURL(),
          },
        },
      ],
    });
  }
}
