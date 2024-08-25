import type commands from "$locales/en-US/commands.json";
import type errors from "$locales/en-US/errors.json";
import { HibikiColors } from "$utils/constants.ts";
import { t } from "$utils/i18n.ts";
import type { CommandInteraction } from "discord.js";

// Generates a generic error embed with a custom description
export async function sendErrorReply(
  // Hacky typing: Only allow dictionaries from the commands: and errors dictionary
  // The string to translate and send
  descriptionString: `commands:${keyof typeof commands}` | `errors:${keyof typeof errors}`,
  interaction: CommandInteraction,
) {
  await interaction.followUp({
    embeds: [
      {
        title: t("errors:ERROR", { lng: interaction.locale }),
        description: t(descriptionString, { lng: interaction.locale }),
        color: HibikiColors.ERROR,
        footer: {
          text: t("errors:ERROR_FOUND_A_BUG", { lng: interaction.locale }),
          icon_url: interaction.client.user.displayAvatarURL(),
        },
      },
    ],
  });
}
