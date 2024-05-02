import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$shared/constants.ts";
import { t } from "$shared/i18n.ts";
import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from "discord.js";

export class AvatarCommand extends HibikiCommand {
  options = [
    {
      // The account to get an avatar from
      type: ApplicationCommandOptionType.User,
      required: false,
    },
    {
      // Whether or not to fetch a server avatar
      type: ApplicationCommandOptionType.Boolean,
      required: false,
    },
  ] satisfies HibikiCommandOptions[];

  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the member data and/or the server member data for resolving the avatar URL
    const memberToFetch = await interaction.options.getUser((this.options as APIOption[])[0]!.name)?.fetch();
    const idToFetch = memberToFetch?.id ?? interaction.user.id;
    const serverAvatar = interaction.options.getBoolean((this.options as APIOption[])[1]!.name);

    // Fetches the member
    const member =
      interaction.guild!.members.cache.find((m) => m.id === idToFetch) ||
      (await interaction.guild!.members.fetch(idToFetch));

    // Error handler
    if (!member) {
      await interaction.followUp({
        embeds: [
          {
            title: t("ERROR", { lng: interaction.locale, ns: "errors" }),
            description: t("ERROR_ACCOUNT", { lng: interaction.locale, ns: "errors" }),
            color: HibikiColors.ERROR,
            footer: {
              text: t("ERROR_FOUND_A_BUG", { lng: interaction.locale, ns: "errors" }),
              icon_url: this.bot.user?.displayAvatarURL(),
            },
          },
        ],
      });

      return;
    }

    // Sends the avatar data
    await interaction.followUp({
      embeds: [
        {
          author: {
            name: t(serverAvatar ? "COMMAND_AVATAR_SERVER_TITLE" : "COMMAND_AVATAR_TITLE", {
              username: member.user.tag,
              lng: interaction.locale,
              ns: "commands",
            }),
            icon_url: serverAvatar
              ? member.displayAvatarURL({ size: 1024 })
              : member.user.displayAvatarURL({ size: 1024 }),
          },
          color: member.user.accentColor ?? HibikiColors.GENERAL,
          image: {
            url: serverAvatar ? member.displayAvatarURL({ size: 1024 }) : member.user.displayAvatarURL({ size: 1024 }),
          },
        },
      ],
    });
  }
}
