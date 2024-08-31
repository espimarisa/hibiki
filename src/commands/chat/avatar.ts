import { type APIOption, HibikiCommand, type HibikiCommandOptions } from "$classes/Command.ts";
import { HibikiColors } from "$utils/constants.ts";
import { sendErrorReply } from "$utils/error.ts";
import { t } from "$utils/i18n.ts";
import { ApplicationCommandOptionType, ApplicationCommandType, type ChatInputCommandInteraction } from "discord.js";

export class AvatarCommand extends HibikiCommand {
  interactionType = ApplicationCommandType.User;

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

  // TODO: Allow running this in DMs
  async runCommand(interaction: ChatInputCommandInteraction) {
    // Gets the member data and/or the server member data for resolving the avatar URL
    const memberToFetch = await interaction.options.getUser((this.options as APIOption[])[0]!.name)?.fetch();
    const idToFetch = memberToFetch?.id ?? interaction.user.id;
    const serverAvatar = interaction.options.getBoolean((this.options as APIOption[])[1]!.name);

    // Guild error handler
    if (!interaction.guild) {
      await sendErrorReply("errors:ERROR_ACCOUNT", interaction);
      return;
    }

    // Fetches the member
    const member =
      interaction.guild.members.cache.find((m) => m.id === idToFetch) ||
      (await interaction.guild.members.fetch(idToFetch));

    // Member error handler
    if (!member) {
      await sendErrorReply("errors:ERROR_ACCOUNT", interaction);
      return;
    }

    // Sends the avatar data
    await interaction.followUp({
      embeds: [
        {
          author: {
            name: t(serverAvatar ? "commands:COMMAND_AVATAR_SERVER_TITLE" : "commands:COMMAND_AVATAR_TITLE", {
              username: member.user.tag,
              lng: interaction.locale,
            }),
            icon_url: serverAvatar
              ? member.displayAvatarURL({ size: 2048 })
              : member.user.displayAvatarURL({ size: 2048 }),
          },
          color: member.user.accentColor ?? HibikiColors.GENERAL,
          image: {
            url: serverAvatar ? member.displayAvatarURL({ size: 2048 }) : member.user.displayAvatarURL({ size: 2048 }),
          },
        },
      ],
    });
  }
}
