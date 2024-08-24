import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

export class AvatarCommand extends HibikiCommand {
  options = [
    {
      // The account to get a banner from
      type: ApplicationCommandOptionType.User,
      required: false,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the member data and/or the server member data for resolving the avatar URL
    const memberToFetch = await interaction.options.getUser((this.options as APIOption[])[0]!.name)?.fetch();
    const idToFetch = memberToFetch?.id ?? interaction.user.id;

    // Fetches the member
    const member =
      interaction.guild!.members.cache.find((m) => m.id === idToFetch) ||
      (await interaction.guild!.members.fetch(idToFetch));

    // Error handler
    const errorMessage = async (noBanner = false) => {
      await interaction.followUp({
        embeds: [
          {
            title: t("errors:ERROR", { lng: interaction.locale }),
            description: noBanner
              ? t("errors:ERROR_NO_BANNER", { lng: interaction.locale })
              : t("errors:ERROR_ACCOUNT", { lng: interaction.locale }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });
    };

    // Error handler
    if (!member) {
      await errorMessage();
      return;
    }

    // Error handler for no banner
    if (!member.user.bannerURL()) {
      await errorMessage(true);
      return;
    }

    // Sends the avatar data
    await interaction.followUp({
      embeds: [
        {
          author: {
            name: t("commands:COMMAND_BANNER_TITLE", {
              username: member.user.tag,
              lng: interaction.locale,
            }),
            icon_url: member.user.displayAvatarURL({ size: 2048 }).toString(),
          },
          color: member.user.accentColor ?? HibikiColors.GENERAL,
          image: {
            url: member.user.bannerURL({ size: 2048 })!.toString(),
          },
        },
      ],
    });
  }
}
