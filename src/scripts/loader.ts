/**
 * @fileoverview Item loader
 * @description Loads commands, events, loggers, etc.
 * @author Espi <contact@espi.me>
 */

import { readdirSync, statSync } from "fs";
import { hibikiClient } from "../structures/Client";
import path from "path";

const COMMANDS_DIRECTORY = path.join(__dirname, "../commands");

/**
 * Loads all items (commands, events, loggers...)
 * @param bot Bot client object
 * @todo Implement the rest of items as we move along. Shouldn't be too hard.
 */

// this probably sucks but i do not care right now
export async function loadItems(bot: hibikiClient): Promise<void> {
  const commandFiles = readdirSync(COMMANDS_DIRECTORY);
  commandFiles.forEach((subfolder) => {
    const stats = statSync(`${COMMANDS_DIRECTORY}/${subfolder}`);
    if (!stats.isDirectory) return;

    const commands = readdirSync(`${COMMANDS_DIRECTORY}/${subfolder}`);

    // Tries to load each command
    commands.forEach(async (cmd) => {
      let command;

      try {
        command = await import(`${COMMANDS_DIRECTORY}/${subfolder}/${cmd}`);
      } catch (err) {
        console.error(`${cmd} failed to load: ${err}`);
      }

      if (!command) return;
      bot.commands.push(command.default);
    });
  });
}
