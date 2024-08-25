import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { hibikiFetch } from "$utils/fetch.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType } from "discord-api-types/v10";
import type { ChatInputCommandInteraction } from "discord.js";

// TODO: Allow searching by title and transcripts!
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

    // Fetches the initial endpoint
    const initialResponse = await hibikiFetch(endpoint);
    let body: XKCDResponse = await initialResponse?.json();

    // Error handler
    if (!initialResponse || initialResponse.status === 404 || !body?.num) {
      await sendErrorReply(
        initialResponse?.status === 404 ? "commands:COMMAND_XKCD_NOTFOUND" : "errors:ERROR_IMAGE",
        interaction,
      );

      return;
    }

    // Fetch a random comic if none is specified
    if (!number) {
      // Gets a random comic to fetch
      const randomNum = Math.floor(Math.random() * body.num) + 1;
      endpoint = `https://xkcd.com/${randomNum}/info.0.json`;

      // Fetches a random comic
      const randomResponse = await hibikiFetch(endpoint);
      const randomBody: XKCDResponse = await randomResponse?.json();
      if (!randomResponse || randomResponse.status === 404 || !randomBody?.num) {
        await sendErrorReply(
          randomResponse?.status === 404 ? "commands:COMMAND_XKCD_NOTFOUND" : "errors:ERROR_IMAGE",
          interaction,
        );

        return;
      }

      // Gets the final response
      const finalResponse = await hibikiFetch(endpoint);
      body = (await finalResponse?.json()) as XKCDResponse;
      if (!finalResponse || finalResponse.status === 404 || !body?.num) {
        await sendErrorReply(
          finalResponse?.status === 404 ? "commands:COMMAND_XKCD_NOTFOUND" : "errors:ERROR_IMAGE",
          interaction,
        );

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
            icon_url: interaction.client.user.displayAvatarURL(),
          },
        },
      ],
    });
  }
}
