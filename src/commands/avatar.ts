/**
 * @file Avatar
 * @description Avatar command
 */

import { HibikiCommand } from "../classes/Command.js";
import { HibikiColors } from "../utils/constants.js";
import { tagUser } from "../utils/format.js";
import { Constants, type CommandInteraction } from "@projectdysnomia/dysnomia";

export class HibikiAvatarCommand extends HibikiCommand {
  description = "Displays a user's avatar.";
  commandType = Constants.ApplicationCommandTypes.USER;
  ephemeral = true;

  public async runWithInteraction(interaction: CommandInteraction) {
    // Gets the user that was targeted with the command
    const user = interaction.data.resolved?.users?.find((user) => user?.id === interaction.data.target_id);

    // Error handler for if a user avatar couldn't be resolved
    if (!user) {
      await interaction.createFollowup({
        embeds: [
          {
            // TODO: Localise
            title: "❌ Error",
            description: "Failed to send that user's avatar. Try again later.",
            color: HibikiColors.ERROR,
          },
        ],
      });

      return;
    }

    // Sends the avatar privately
    await interaction.createFollowup({
      embeds: [
        {
          title: `${tagUser(user)}'s avatar`,
          color: HibikiColors.GENERAL,
          image: {
            url: user.dynamicAvatarURL(undefined, 2048),
          },
        },
      ],
    });
  }
}
