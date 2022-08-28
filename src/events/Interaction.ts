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

    // Check for command cooldowns
    if (command.cooldown > 0) {
      // Gets the cooldown
      const cooldown = this.bot.cooldowns.get(command.name + interaction.user.id);

      // Sends a message if the command is under cooldown
      if (cooldown) {
        // Sets the cooldown
        this.bot.cooldowns.set(command.name + interaction.user.id, new Date());
        setTimeout(() => this.bot.cooldowns.delete(command.name + interaction.user.id), command.cooldown);

        await interaction.reply({
          embeds: [
            {
              title: getStringFunction("global.ERROR"),
              description: getStringFunction("global.COMMAND_COOLDOWN", {
                command: command.name,
                time: Math.ceil((cooldown.getTime() - Date.now()) / 1000),
              }),
              color: this.bot.config.colours.error,
            },
          ],
        });

        return;
      }
    }

    try {
      // Runs the command
      await interaction.deferReply();
      await command.runWithInteraction?.(interaction);
    } catch (error) {
      throw new Error(`${error}`);
    }
  }
}
