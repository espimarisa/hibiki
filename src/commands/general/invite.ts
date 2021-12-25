import type { CommandInteraction, Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class InviteCommand extends HibikiCommand {
  description = "Gives a link to invite me to your server.";

  public async getResponse(localeParser: GetLocaleString) {
    const embeds = {
      embeds: [
        {
          title: localeParser("general.COMMAND_INVITE_TITLE"),
          description: localeParser("general.COMMAND_INVITE_DESCRIPTION", { id: this.bot.user?.id }),
          color: this.bot.config.colours.primary,
        },
      ],
    };

    return embeds;
  }

  public async runWithInteraction(interaction: CommandInteraction) {
    const response = await this.getResponse(interaction.getLocaleString);
    await interaction.reply(response);
  }

  public async runWithMessage(msg: Message) {
    // @ts-expect-error Not yet implemented
    const response = await this.getResponse(msg.getLocaleString);
    // @ts-expect-error Not yet implemented
    await Interaction.reply(response);
  }
}
