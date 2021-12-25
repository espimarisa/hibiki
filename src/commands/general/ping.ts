import type { CommandInteraction, Message } from "discord.js";
import { HibikiCommand } from "../../classes/Command";

export class PingCommand extends HibikiCommand {
  description = "Checks the current status of the bot.";

  public async runWithInteraction(interaction: CommandInteraction) {
    const response = await this.getResponse(interaction.getLocaleString);
    await interaction.reply(response);
  }

  public async runWithMessage(msg: Message) {
    // @ts-expect-error This isn't complete yet!
    const response = await this.getResponse();
    await msg.reply(response);
  }

  public async getResponse(localeParser: GetLocaleString) {
    const embeds: FullMessageEmbedData = {
      embeds: [
        {
          title: localeParser("general.COMMAND_PING_PONG"),
          description: localeParser("general.COMMAND_PING_DESCRIPTION", { latency: this.bot.ws.ping }),
          color: this.bot.config.colours.primary,
        },
      ],
    };

    return embeds;
  }
}
