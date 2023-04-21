/**
 * @file Interaction
 * @description Runs interaction commands
 */

import type { HibikiLocaleCode } from "../typings/locales.js";
import type { CommandInteraction } from "@projectdysnomia/dysnomia";
import { HibikiEvent } from "../classes/Event.js";
import { HibikiColors } from "../utils/constants.js";
import { sanitizedEnv } from "../utils/env.js";
import util from "node:util";

export class HibikiInteractionEvent extends HibikiEvent {
  events: HibikiEventListener[] = ["interactionCreate"];

  public async run(_event: HibikiEventListener[], interaction: CommandInteraction) {
    // Don't run any interactions that aren't commands or that don't actually exist
    if (!interaction || !interaction.data?.name) return;

    // Searches for the right command to run
    const command = this.bot.commands.get(interaction.data.name);
    if (!command) return;

    // Gets the user's locale
    let locale = sanitizedEnv.DEFAULT_LOCALE as HibikiLocaleCode;
    const guildconfig = await this.bot.db.getGuildConfig(interaction.guildID as DiscordSnowflake);
    const userLocale = await this.bot.localeSystem.getUserLocale(interaction.user?.id as DiscordSnowflake, this.bot);
    if (userLocale) locale = userLocale;
    else if (guildconfig?.locale && !userLocale) locale = guildconfig.locale;

    // Wrapper for getLocaleFunction();
    const getStringFunction = this.bot.localeSystem.getLocaleFunction(locale as HibikiLocaleCode);
    interaction.getString = getStringFunction;

    try {
      // Defers the command for a followup. If ephemeral is set, set the flag
      await interaction.defer(command.ephemeral ? 64 : undefined);

      // Runs the command
      await command.runWithInteraction?.(interaction);
    } catch (error) {
      await interaction.createFollowup({
        embeds: [
          {
            // TODO: Localise
            title: `❌ Error while running ${command.name}`,
            description: "```TS\n" + `${(error as Error).stack}` + "```",
            color: HibikiColors.ERROR,
            footer: {
              icon_url: this.bot.user.dynamicAvatarURL(),
              // TODO: Localise
              text: "Found a bug? - https://github.com/sysdotini/hibiki/issues",
            },
          },
        ],
      });

      throw new Error(util.inspect(error));
    }
  }
}
