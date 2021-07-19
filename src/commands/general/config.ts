/**
 * @file Config command
 * @description Sends the latest version's changelog
 */

import type { Emoji, Member, Message, TextChannel } from "eris";

import type { HibikiClient } from "../../classes/Client";
import type { ResponseData } from "../../typings/utils";

import { Command } from "../../classes/Command";
import { localizeItemTypes, localizeSetupItems } from "../../utils/format";
import { askForLocale, askForValue, askYesNo } from "../../utils/ask";
import { validItems } from "../../utils/validItems";
import { timeoutHandler, waitFor } from "../../utils/waitFor";

const categoryEmojis = {
  features: "✨",
  greeting: "👋",
  logging: "📜",
  music: "🎵",
  pinboard: "📌",
  roles: "👥",
  sniping: "🚫",
  automod: "🔨",
};

const categories: ValidItemsCategory[] = [];
const back = "⬅️";
const submit = "☑";
const deleteEmoji = "🗑";

validItems.forEach((s) => {
  const cat = categories.find((c) => c.name === s.category);
  if (!s.category) return;
  if (s.category === "profile") return;
  if (!cat) categories.push({ name: s.category, emoji: categoryEmojis[s.category], items: [s.id] });
  else {
    cat.items.push(s.id);
    categories.forEach((c) => categories.find((cc) => cc.id === c.id) || c);
  }
});

// TODO: Add a pagified config viewer (god help us)
export class SetupCommand extends Command {
  description = "Edits the bot's config.";
  aliases = ["cfg", "guildconfig", "serverconfig", "setup"];
  allowdisable = false;
  cooldown = 5000;
  staff = true;

  async run(msg: Message<TextChannel>): Promise<void> {
    const localeEmojis = {};
    const localeNames = {};
    Object.keys(this.bot.localeSystem.locales).forEach((locale) => {
      localeEmojis[this.bot.localeSystem.getLocale(locale, "EMOJI")] = this.bot.localeSystem.getLocale(locale, "NAME");
      localeNames[this.bot.localeSystem.getLocale(locale, "EMOJI")] = locale;
    });

    // Gets the guildconfig and inserts a blank one if needed
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig) {
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);
      guildconfig = { id: msg.channel.guild.id };
    }

    // Localizes command categories
    function localizeCategories(category: string) {
      switch (category) {
        case "features":
          return msg.locale("global.FEATURES");
        case "roles":
          return msg.locale("global.ROLES");
        case "logging":
          return msg.locale("global.LOGGING");
        case "greeting":
          return msg.locale("global.GREETINGS");
        case "sniping":
          return msg.locale("global.SNIPING");
        case "pinboard":
          return msg.locale("global.PINBOARD");
        case "delete":
          return msg.locale("global.DELETE");
        case "music":
          return msg.locale("global.MUSIC");
        case "automod":
          return msg.locale("global.AUTOMOD");
      }
    }

    // Sends the original message
    const primaryEmbed = {
      embed: {
        title: `🔧 ${msg.locale("general.CONFIG")}`,
        color: msg.convertHex("general"),
        fields: categories.concat([{ emoji: deleteEmoji, name: "delete", items: ["delete"] }]).map((cat) => {
          return {
            name: `${cat.emoji.length > 2 ? "<:" : ""}${cat.emoji}${cat.emoji.length > 2 ? ">" : ""} ${localizeCategories(cat.name)}`,
            value: `${cat.items.map((i: string) => `\`${localizeSetupItems(msg.locale, i, true)}\``).join(", ")}`,
          };
        }),
        footer: {
          text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    };
    const omsg = await msg.channel.createMessage(primaryEmbed);
    let selectingCategory = false;
    let selectingItem = false;

    // Gets a category
    async function getCategory(message: Message, bot: HibikiClient, editMsg: boolean) {
      if (editMsg) {
        message.edit({
          embed: {
            title: `🔧 ${msg.locale("general.CONFIG")}`,
            fields: categories.map((cat) => {
              return {
                name: `${cat.emoji} ${localizeCategories(cat.name)})`,
                value: `${cat.items.map((i: string) => `\`${localizeSetupItems(msg.locale, i, true)}\``).join(", ")}`,
              };
            }),
            footer: {
              text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
              icon_url: msg.author.dynamicAvatarURL(),
            },
          },
        });
      }

      // Removes all reactions from the message if there are any
      if (Object.getOwnPropertyNames(omsg.reactions).length > 0) await omsg.removeReactions();

      // Ensures that reactions are added to the right items
      async function addCategoryEmojis() {
        const emojis = categories.map((cat) => cat.emoji);
        for await (const emoji of emojis) {
          if (!selectingCategory) await omsg.addReaction(emoji);
        }

        if (!selectingCategory) await omsg.addReaction(deleteEmoji);
      }

      addCategoryEmojis();

      let category: ValidItem;

      // Handles deleting a config
      await waitFor(
        "messageReactionAdd",
        120000,
        async (m: Message, emoji: Emoji, user: Member) => {
          if (m.id !== message.id || user.id !== msg.author.id || !emoji.name) return;
          if (emoji.name === deleteEmoji) {
            omsg.editEmbed(`❓ ${msg.locale("global.CONFIRMATION")}`, msg.locale("general.CONFIG_DELETE_CONFIRMATION"));
            // Waits for response
            const response = (await askYesNo(bot, msg.locale, msg.author.id, msg.channel.id).catch((err) =>
              timeoutHandler(err, msg, msg.locale),
            )) as ResponseData;

            // If the user cancels deleting
            if (!response || response.response === false) {
              return omsg.editEmbed(msg.locale("global.CANCELLED"), msg.locale("general.CONFIG_CANCELLED_DELETE"), "error");
            }

            // Deletes the config and the askYesNo message
            await bot.db.deleteGuildConfig(msg.channel.guild.id);
            omsg.removeReaction(deleteEmoji, user.id);
            omsg.editEmbed(msg.locale("global.SUCCESS"), msg.locale("general.CONFIG_DELETED"), "success");
            setTimeout(() => {
              omsg.edit(primaryEmbed);
            }, 3000);
            return;
          }

          // Finds the category
          category = categories.find((cat) =>
            cat.emoji.length > 2 ? cat.emoji.split(":")[1] === emoji.id : cat.emoji === emoji.name,
          ) as any;

          if (!category) return;
          if (category === "profile") return;
          await m.removeReactions();
          return true;
        },
        bot,
      ).catch((err) => timeoutHandler(err, omsg, msg.locale));
      return category;
    }

    // Returns the category items
    function itemsEmbed(category: ValidItemsCategory) {
      return {
        embed: {
          title: `🔧 ${msg.locale("general.CONFIG")}`,
          color: msg.convertHex("general"),
          footer: {
            text: msg.locale("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: category.items.map((cat: string) => {
            const setting = validItems.find((s) => s.id === cat);
            return {
              name: `${setting.emoji} ${localizeSetupItems(msg.locale, setting.id, true)}`,
              value: `${localizeSetupItems(msg.locale, setting.id)}`,
              inline: false,
            };
          }),
        },
      };
    }

    // Gets the category and handles category timeouts
    let category = (await getCategory(omsg, this.bot, false)) as any;
    selectingCategory = true;
    if (!category || category?.error === "timeout") {
      omsg.editEmbed(msg.locale("global.ERROR"), msg.locale("global.TIMEOUT_REACHED"), "error");
      return;
    }

    omsg.edit(itemsEmbed(category));
    await omsg.removeReactions();
    async function addItemsEmojis() {
      const emojis = category.items.map(async (cat: string) => validItems.find((s) => s.id === cat).emoji);
      for await (const emoji of emojis) {
        if (!selectingItem) await omsg.addReaction(emoji);
      }

      if (!selectingItem) await omsg.addReaction(back);
    }

    addItemsEmojis();

    // await category.items.map(async (cat: string) => omsg.addReaction(validItems.find((s) => s.id === cat).emoji));
    // omsg.addReaction(back);

    // Waits for the reaction
    await waitFor(
      "messageReactionAdd",
      60000,
      async (m: Message<TextChannel>, emoji: Emoji, user: Member) => {
        if (user.id !== msg.author.id) return;
        if (m.id !== omsg.id) return;
        if (!emoji.name) return;
        if (selectingItem) return;
        if (emoji.name === back) {
          category = { repeat: true };
          return true;
        }

        // Finds the setting
        const setting = validItems.find(
          (s) => s.id === category.items.find((cat: string) => validItems.find((s) => s.id === cat).emoji === emoji.name),
        );

        // Removes reactions
        if (!setting) return;
        if (setting.category === "Profile") return;

        omsg.removeReaction(emoji.name, user.id);

        // Handles booleans
        if (setting.type === "boolean") {
          if (typeof guildconfig[setting.id] === "boolean") guildconfig[setting.id] = !guildconfig[setting.id];
          else guildconfig[setting.id] = typeof setting.default === "undefined" ? true : !setting.default;

          // Updates the config
          await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
          omsg.editEmbed(
            localizeSetupItems(msg.locale, setting.id, true),
            `${setting.id} ${msg.locale("global.HAS_BEEN")} **${
              guildconfig[setting.id] ? `${msg.locale("global.ENABLED")}` : `${msg.locale("global.DISABLED")}`
            }**.`,
            "success",
          );
          setTimeout(() => omsg.edit(itemsEmbed(category)), 2000);
        }

        // Handles punishment types
        else if (setting.type === "punishment" || setting.type === "raidPunishment") {
          selectingItem = true;
          let punishments: Record<string, string>;
          let punishmentLabels: Record<string, string>;
          let punishmentDescription: Record<string, string>;
          // Gets punishment labels
          const banLabel = msg.locale("moderation.BAN");
          const kickLabel = msg.locale("moderation.KICK");
          const muteLabel = msg.locale("moderation.MUTE");
          const purgeLabel = msg.locale("moderation.PURGE");
          const warnLabel = msg.locale("moderation.WARN");

          // Raid punishments
          if (setting.type === "raidPunishment") {
            punishments = { Ban: "1️⃣", Kick: "2️⃣", Mute: "3️⃣" };
            punishmentLabels = { Ban: banLabel, Kick: kickLabel, Mute: muteLabel };
            punishmentDescription = { Ban: null, Kick: null, Mute: null };
          } else {
            punishments = { Mute: "1️⃣", Purge: "2️⃣", Warn: "3️⃣" };
            punishmentLabels = { Mute: muteLabel, Purge: purgeLabel, Warn: warnLabel };
            punishmentDescription = { Mute: null, Purge: null, Warn: null };
          }

          const validpunishments = Object.keys(punishments);
          await omsg.removeReactions();

          omsg.editEmbed(
            `🔨 ${msg.locale("general.PUNISHMENTS_FOR", { label: localizeSetupItems(msg.locale, setting.id, false, true) })}`,
            validpunishments
              .map(
                (p) =>
                  `${punishments[p]} ${punishmentLabels[p]}${punishmentDescription[p] ? punishmentDescription[p] : ""}:` +
                  ` **${guildconfig[setting.id]?.includes(p) ? `${msg.locale("global.ENABLED")}` : `${msg.locale("global.DISABLED")}`}**`,
              )
              .join("\n"),
          );

          validpunishments.forEach((p) => omsg.addReaction(punishments[p]));
          omsg.addReaction(submit);

          // Waits for reactions
          await waitFor(
            "messageReactionAdd",
            60000,
            async (m: Message, emoji: Emoji, user: Member) => {
              if (m.id !== omsg.id) return;
              if (user.id !== msg.author.id) return;
              if (!emoji.name) return;

              // Handles submissions
              if (emoji.name === submit) {
                await omsg.removeReactions();
                await this.bot.db.updateGuildConfig(msg.channel.guild.id, guildconfig);
                omsg.edit(itemsEmbed(category));
                category.items.map((cat: string) => omsg.addReaction(validItems.find((s) => s.id === cat).emoji));
                omsg.addReaction(back);
                return true;
              }

              // Removes reactions & slices punishments
              omsg.removeReaction(emoji.name, user.id);
              const punishment = validpunishments.find((p) => punishments[p] === emoji.name);
              if (!guildconfig[setting.id] && setting.type === "punishment") guildconfig[setting.id] = [];

              // Punishments
              if (setting.type === "punishment") {
                if (guildconfig[setting.id].includes(punishment)) {
                  guildconfig[setting.id].splice(guildconfig[setting.id].indexOf(punishment), 1);
                } else guildconfig[setting.id].push(punishment);
              } else {
                guildconfig[setting.id] = punishment;
              }

              // Sends punishment toggle message
              omsg.editEmbed(
                `🔨 ${msg.locale("general.PUNISHMENTS_FOR", { label: localizeSetupItems(msg.locale, setting.id, false, true) })}`,
                validpunishments
                  .map(
                    (p) =>
                      `${punishments[p]} ${punishmentLabels[p]}${punishmentDescription[p] ? punishmentDescription[p] : ""}: **${
                        guildconfig[setting.id].includes(p) ? `${msg.locale("global.ENABLED")}` : `${msg.locale("global.DISABLED")}`
                      }**`,
                  )
                  .join("\n"),
              );
            },
            this.bot,
          ).catch((err) => timeoutHandler(err, omsg, msg.locale));
        } else if (setting.type === "locale") {
          selectingItem = true;
          await askForLocale(omsg, msg, this.bot, guildconfig, itemsEmbed, category, true);
          selectingItem = false;
          addItemsEmojis();
        }

        // Asks for a response if it's anything else
        else {
          omsg.editEmbed(`🔧 ${msg.locale("general.CONFIG")}`, localizeItemTypes(msg.locale, setting.type));
          askForValue(msg, omsg, this.bot, category, guildconfig, itemsEmbed, setting);
        }
      },

      this.bot,
    ).catch((err) => timeoutHandler(err, omsg, msg.locale));

    // Deletes & reruns the command
    if (category.repeat) {
      omsg.delete();
      return this.run(msg);
    }
  }
}
