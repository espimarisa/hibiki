import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
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

  // TODO: Allow running this in DMs
  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the member data and/or the server member data for resolving the avatar URL
    const memberToFetch = await interaction.options.getUser((this.options as APIOption[])[0]!.name)?.fetch();
    const idToFetch = memberToFetch?.id ?? interaction.user.id;

    // Guild error handler
    if (!interaction.guild) {
      await sendErrorReply("errors:ERROR_SERVER", interaction);
      return;
    }

    // Fetches the member
    const member =
      interaction.guild.members.cache.find((m) => m.id === idToFetch) ||
      (await interaction.guild.members.fetch(idToFetch));

    // Member error handler
    if (!member?.user?.bannerURL()) {
      await sendErrorReply("errors:ERROR_NO_BANNER", interaction);
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
            icon_url: member.user.displayAvatarURL(),
          },
          color: member.user.accentColor ?? HibikiColors.GENERAL,
          image: {
            url: member.user.bannerURL({ size: 2048 })!,
          },
        },
      ],
    });
  }
}
