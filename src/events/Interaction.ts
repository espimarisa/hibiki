/**
 * @file Interaction
 * @description Handles slash command interactions
 * @module HibikiInteractionEvent
 */

import type { ChatInputCommandInteraction } from "discord.js";
import { HibikiEvent } from "../classes/Event.js";

export class HibikiInteractionEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["interactionCreate"];

  public async run(_event: HibikiEventEmitter, interaction: ChatInputCommandInteraction) {
    if (!interaction || !interaction.isCommand() || !interaction.isChatInputCommand()) return;

    // Finds the command
    const command = this.bot.commands.find((c) => c.name === interaction.commandName);
    if (!command) return;

    // Gets the user's locale
    let locale = this.bot.config.defaultLocale;
    const guildconfig = await this.bot.db.getGuildConfig(interaction.guild?.id as DiscordSnowflake);
    const userLocale = await this.bot.localeSystem.getUserLocale(interaction.user.id, this.bot);
    if (userLocale) locale = userLocale;
    else if (guildconfig?.locale && !userLocale) locale = guildconfig.locale;

    // Wrapper for getLocaleFunction();
    const getStringFunction = this.bot.localeSystem.getLocaleFunction(locale);
    interaction.getString = getStringFunction;

    try {
      // Runs the command
      await interaction.deferReply({
        ephemeral: command.ephemeral,
      });
      await command.runWithInteraction?.(interaction);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
}
