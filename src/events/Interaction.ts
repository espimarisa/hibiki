/**
 * @file Interaction
 * @description Handles slash command interactions
 * @module HibikiInteractionEvent
 */

import type { CommandInteraction } from "discord.js";
import { HibikiEvent } from "../classes/Event";

export class HibikiInteractionEvent extends HibikiEvent {
  events: HibikiEventEmitter[] = ["interactionCreate"];

  public async run(_event: HibikiEventEmitter, interaction: CommandInteraction) {
    if (!interaction || !interaction.isCommand()) return;

    // Check if the user is in the blacklist
    const blacklisted = await this.bot.db.getBlacklistItem(interaction.user.id, "USER");
    if (blacklisted) {
      return;
    }

    // Finds the command
    const command = this.bot.commands.find((c) => c.name === interaction.commandName);
    if (!command) return;

    // Gets the user's locale
    let locale = this.bot.config.hibiki.locale;
    const guildconfig = await this.bot.db.getGuildConfig(interaction.guild?.id as DiscordSnowflake);
    const userLocale = await this.bot.localeSystem.getUserLocale(interaction.user.id, this.bot);
    if (userLocale) locale = userLocale;
    else if (guildconfig?.locale && !userLocale) locale = guildconfig.locale;

    // Wrapper for getLocaleFunction();
    const getStringFunction = this.bot.localeSystem.getLocaleFunction(locale);
    interaction.getString = getStringFunction;

    // Check for command cooldowns
    if (command.cooldown > 0) {
      const cooldown = this.bot.cooldowns.get(command.name + interaction.user.id);
      if (cooldown) {
        interaction.reply({
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
      this.bot.cooldowns.set(command.name + interaction.user.id, new Date());
      setTimeout(() => this.bot.cooldowns.delete(command.name + interaction.user.id), command.cooldown);
    }

    if (command.category === "nsfw" && interaction.channel?.type === "GUILD_TEXT" && !interaction.channel.nsfw) {
      interaction.reply({
        embeds: [
          {
            title: getStringFunction("global.ERROR"),
            description: getStringFunction("nsfw.NOT_NSFW_CHANNEL_OR_DM"),
            color: this.bot.config.colours.error,
          },
        ],
      });
      return;
    }

    // Runs the command
    try {
      // @ts-expect-error This whole function wouldn't even run if there was no interaction.
      await command.runWithInteraction(interaction);
    } catch (error) {
      throw new Error(error as string);
    }
  }
}
