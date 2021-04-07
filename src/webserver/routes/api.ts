/**
 * @file API routes
 * @description Routings for the dashboard API
 * @module webserver/routes/api
 */

import type { BulmaselectValues } from "bulmaselect";
import type { Profile } from "passport-discord";
import type { HibikiClient } from "../../classes/Client";
import { defaultEmojiRegex, emojiIDRegex, fullInviteRegex } from "../../utils/constants";
import { validItems } from "../../utils/validItems";
import { getManagableGuilds } from "../../utils/webserver";
import dayjs from "dayjs";
import express from "express";
import rateLimit from "express-rate-limit";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
const arrayItemTypes = ["channelArray", "roleArray", "punishment", "raidPunishment", "array"];
const router = express.Router();

dayjs.extend(utc);
dayjs.extend(timezone);

const apiRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: "Too many API requests in a short period of time.",
});

export function apiRoutes(bot: HibikiClient) {
  router.get("/getItems/", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "You are not currently authenticated." }).end();

    /**
     * Sends bot commands
     */

    if (req.query.commands) {
      const commands: BulmaselectValues[] = [];
      bot.commands.forEach((command) => {
        if (!commands.find((cmd) => cmd.label === command.category) && command.category !== "owner") {
          commands.push({ label: command.category, type: "group", children: [] });
        }
      });

      // Ignores owner cmds
      bot.commands.forEach((command) => {
        if (command.category === "owner") return;
        if (command.allowdisable === false) return;
        commands.find((c) => c.label === command.category).children.push({ label: command.name });
      });

      // Sends commands
      return res.status(200).send(commands);
    }

    /**
     * Sends profile items
     */

    if (req.query.profile) {
      const profileItems: UserConfig[] = [];
      validItems.forEach((item) => {
        if (item.category !== "profile") return;
        profileItems.push(item);
      });

      return res.status(200).send(profileItems);
    }

    // Sends managable guild items
    if (req.query.manage) {
      const manageItems: ValidItem[] = [];
      validItems.forEach((item) => {
        if (item.category === "profile") return;
        manageItems.push(item);
      });

      return res.status(200).send(manageItems);
    }

    // Sends configurable validItems
    res.status(200).send(validItems);
  });

  /**
   * Gets a guildConfig
   */

  router.get("/getGuildConfig/:id", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "You are not currently authenticated." }).end();

    // Checks to see if the user has permission to manage the guild
    const guild = getManagableGuilds(req, req.user as Profile, bot.guilds);
    if (!guild) return res.status(401).send({ error: "Unauthorized to get this guild's config." }).end();

    // Gets the guildConfig
    const guildConfig = await bot.db.getGuildConfig(guild.id);
    if (!guildConfig) return res.status(204).end();
    res.send(guildConfig);
  });

  /**
   * Updates a guildConfig
   */

  router.post("/updateGuildConfig/:id", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "You are not currently authenticated." }).end();

    // Checks to see if the user has permission to manage the guild
    const guild = getManagableGuilds(req, req.user as Profile, bot.guilds);
    if (!guild) return res.status(401).send({ error: "Unauthorized to update this guild's config." }).end();

    // Gets config
    let guildConfig = await bot.db.getGuildConfig(guild.id);

    // Inserts guildConfig
    if (!guildConfig) {
      guildConfig = { id: guild.id };
      await bot.db.insertBlankGuildConfig(guild.id);
    }

    // If no guildConfig
    if (!req.body) return res.status(204).end();
    guildConfig = req.body;

    // Updates a guildConfig with the values
    Object.keys(guildConfig).forEach((value) => {
      if (value === "id") return;
      const option = guildConfig[value];
      if (!option) return;

      // Finds the item
      const item = validItems.find((i) => i.id === value);
      if (!item || item?.category === "profile" || option === null) delete guildConfig[value];

      // Validates each item type
      switch (item.type) {
        // Numbers
        case "number": {
          if (typeof option !== "number") delete guildConfig[value];
          if (item?.maximum && option > item?.maximum) guildConfig[value] = item?.maximum;
          if (item?.minimum && option < item?.minimum) guildConfig[value] = item?.minimum;
          break;
        }

        // Punishments
        case "punishment": {
          if (Array.isArray(guildConfig[value]) && guildConfig[value].length) {
            guildConfig[value] = option.filter((p: string) => ["Purge", "Warn", "Mute"].includes(p));
          }

          guildConfig[value] = guildConfig[value].filter((punishment: string) => ["Purge", "Mute", "Warn"].includes(punishment));
          break;
        }

        // Raid punishments
        case "raidPunishment": {
          if (Array.isArray(guildConfig[value]) && guildConfig[value].length) {
            guildConfig[value] = option.filter((p: string) => ["Ban", "Kick", "Mute"].includes(p));
          }

          guildConfig[value] = guildConfig[value].filter((punishment: string) => ["Ban", "Kick", "Mute"].includes(punishment));
          break;
        }

        // Channels
        case "channel": {
          if (!bot.guilds.get(guild.id).channels.find((channel) => channel.id === option || channel.type !== 0)) {
            guildConfig[value] = null;
          }

          break;
        }

        // Voice channels
        case "voiceChannel": {
          if (!bot.guilds.get(guild.id).channels.find((channel) => channel.id === option || channel.type !== 2)) {
            guildConfig[value] = null;
          }

          break;
        }

        // Channel arrays
        case "channelArray": {
          if (Array.isArray(guildConfig[value]) && guildConfig[value].length) {
            guildConfig[value] = option.filter((c: string) => bot.guilds.get(guild.id).channels.find((channel) => channel.id === c));
          }

          break;
        }

        // Role arrays
        case "roleArray": {
          if (Array.isArray(guildConfig[value]) && guildConfig[value].length) {
            guildConfig[value] = option.filter((r: string) => bot.guilds.get(guild.id).roles.find((rol) => rol.id === r));
            if (item?.maximum && guildConfig[value].length > item?.maximum) guildConfig[value].length = item?.maximum;
          }

          break;
        }

        // Roles
        case "role": {
          if (!bot.guilds.get(guild.id).roles.find((r) => r.id === option || r.managed)) {
            delete guildConfig[value];
          }

          break;
        }

        // Booleans
        case "boolean": {
          if (typeof option !== "boolean") delete guildConfig[value];
          break;
        }

        // Strings
        case "string": {
          // Filters
          if (item?.inviteFilter) guildConfig[value] = guildConfig[value].replace(fullInviteRegex, "");
          guildConfig[value] = guildConfig[value].replace(emojiIDRegex, "");

          // Maximum & minimums
          if (item?.maximum) guildConfig[value] = guildConfig[value].substring(0, item?.maximum);
          if (item?.minimum && guildConfig[value].length < item?.minimum) delete guildConfig[value];
          break;
        }

        // Emojis
        case "emoji": {
          if (!defaultEmojiRegex.test(guildConfig[value])) delete guildConfig[value];
          break;
        }

        // Locales
        case "locale": {
          if (!Object.keys(bot.localeSystem.locales).includes(guildConfig[value])) {
            delete guildConfig[value];
          }

          break;
        }
      }

      // Disabled categories
      if (value === "disabledCategories" && guildConfig[value]) {
        const categories: string[] = [];

        // Pushes each command
        bot.commands.forEach((c) => {
          if (!categories.includes(c.category) && c.category !== "owner") categories.push(c.category);
        });

        // Filters guildConfig
        guildConfig[value] = guildConfig[value].filter((category) => categories.includes(category));
      }

      // Disabled commands
      if (value === "disabledCmds" && guildConfig[value])
        guildConfig[value] = guildConfig[value].filter((cmd) => {
          const command = bot.commands.find((c) => c.name === cmd);
          if (command?.allowdisable) return true;
          return false;
        });

      // Arrays
      if (arrayItemTypes.includes(item?.type) && (!Array.isArray(guildConfig[value]) || !guildConfig[value].length)) {
        delete guildConfig[value];
      }
    });

    // Replaces the guildConfig with the new one
    await bot.db
      .updateGuildConfig(guild.id, guildConfig)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        res.status(500).send({ error: "An error occured while updating the guildConfig. Try reloading the page." });
      });
  });

  /**
   * Resets a guildConfig
   */

  router.post("/deleteGuildConfig/:id", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "You are not currently authenticated." }).end();

    // Checks to see if the user has permission to manage the guild
    const guild = getManagableGuilds(req, req.user as Profile, bot.guilds);
    if (!guild) return res.status(401).send({ error: "Unauthorized to update this guild's config." }).end();

    // Deletes the config
    await bot.db
      .deleteGuildConfig(guild.id)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        res.status(500).send({ error: "An error occured while deleting the guildConfig. Try reloading the page." });
      });
  });

  /**
   * Gets a userConfig
   */

  router.get("/getUserConfig/:id", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "You are not currently authenticated." }).end();
    const user = req.user as Profile;

    // Updates the userconfig
    const userConfig = await bot.db.getUserConfig(user.id);
    if (!userConfig) return res.status(204).end();
    res.send(userConfig);
  });

  /**
   * Updates a userConfig
   */

  router.post("/updateUserConfig/:id", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "You are not currently authenticated." }).end();

    // Gets the userConfig
    const user = req.user as Profile;
    let userConfig = await bot.db.getUserConfig(user.id);
    if (!req.body) return res.status(204).end();

    // Inserts a blank userConfig
    if (!userConfig) {
      userConfig = { id: user.id };
      await bot.db.insertBlankUserConfig(user.id);
    }

    if (userConfig.id !== user.id) return res.status(403).send({ error: "You are unauthorized to manage this user's config." }).end();
    else if (!req.body.id) req.body.id = user.id;
    userConfig = req.body;

    // Updates the userConfig and validates input
    Object.keys(userConfig).forEach((value) => {
      if (value === "id") return;
      const option = userConfig[value];
      if (!option) return;

      // Finds the item
      const item = validItems.find((i) => i.id === value);
      if (!item || item?.category !== "profile") delete userConfig[value];

      // Validates each item type
      switch (item.type) {
        // Numbers
        case "number": {
          if (typeof option !== "number") return delete userConfig[value];
          if (item?.maximum && option > item?.maximum) userConfig[value] = item?.maximum;
          if (item?.minimum && option < item?.minimum) userConfig[value] = item?.minimum;
          break;
        }

        // Booleans
        case "boolean": {
          if (typeof option !== "boolean") delete userConfig[value];
          break;
        }

        // Strings
        case "string": {
          // Removes invites and emojis
          if (item?.inviteFilter) {
            (userConfig[value] = userConfig[value].replace(fullInviteRegex, "")) &&
              (userConfig[value] = userConfig[value].replace(emojiIDRegex, ""));
          }

          // Maximum & minimums
          if (item?.maximum) userConfig[value] = userConfig[value].substring(0, item?.maximum);
          if (item?.minimum && userConfig[value].length < item?.minimum) delete userConfig[value];
          break;
        }

        // Arrays
        case "array": {
          if (!Array.isArray(userConfig[value])) delete userConfig[value];
          break;
        }

        // Timezone
        case "timezone": {
          let invalidTimezone = false;

          try {
            dayjs(new Date()).tz(userConfig[value]);
          } catch (err) {
            invalidTimezone = true;
          }

          if (invalidTimezone) delete userConfig[value];
          break;
        }

        // Locale
        case "locale": {
          if (!Object.keys(bot.localeSystem.locales).includes(userConfig[value])) {
            delete userConfig[value];
          }

          break;
        }

        // Pronouns
        case "pronouns": {
          console.log(option !== 1, option !== 2, option !== 3);
          if (typeof option !== "number") return delete userConfig[value];
          if (option !== 1 && option !== 2 && option !== 3) return delete userConfig[value];
          break;
        }
      }
    });

    await bot.db
      .updateUserConfig(user.id, userConfig)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        res.status(500).send({ error: "An error occured while updating the userConfig. Try reloading the page." });
      });
  });

  /**
   * Deletes a userConfig
   */

  router.post("/deleteUserConfig/:id", apiRateLimit, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send({ error: "Unauthorized to reset this user's config." }).end();
    const user = req.user as Profile;

    await bot.db
      .deleteUserConfig(user.id)
      .then(() => {
        res.sendStatus(200);
      })
      .catch(() => {
        res.status(500).send({ error: "An error occured while deleting the userConfig. Try reloading the page." });
      });
  });

  return router;
}
