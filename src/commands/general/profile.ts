import type { Emoji, Member, Message, TextChannel } from "eris";
import type { LocaleSystem } from "../../classes/Locale";
import { Command } from "../../classes/Command";
import { askForLocale, askForValue, askYesNo } from "../../utils/ask";
import { localizeProfileItems } from "../../utils/format";
import { validItems } from "../../utils/validItems";
import { timeoutHandler, waitFor } from "../../utils/waitFor";

const deleteEmoji = "🗑";
const items = validItems.filter((item) => item.category === "profile");

export class ProfileCommand extends Command {
  description = "Updates or views your profile's configuration.";
  aliases = ["usercfg", "userconfig"];
  cooldown = 5000;
  allowdisable = false;

  async run(msg: Message<TextChannel>) {
    const localeEmojis = {};
    const localeNames = {};
    Object.keys(this.bot.localeSystem.locales).forEach((locale) => {
      localeEmojis[this.bot.localeSystem.getLocale(locale, "EMOJI")] = this.bot.localeSystem.getLocale(locale, "NAME");
      localeNames[this.bot.localeSystem.getLocale(locale, "EMOJI")] = locale;
    });

    // Gets a user's config and updates it
    let userconfig = await this.bot.db.getUserConfig(msg.author.id);
    if (!userconfig) {
      await this.bot.db.insertBlankUserConfig(msg.author.id);
      userconfig = { id: msg.author.id };
    }

    // Sets pronouns
    const pronouns = [
      msg.string("global.NO_PREFERENCE"),
      msg.string("global.PRONOUNS_HE"),
      msg.string("global.PRONOUNS_SHE"),
      msg.string("global.PRONOUNS_THEY"),
    ];

    // Sets pronoun reactions
    const pronounEmojis = {
      "1️⃣": pronouns[0],
      "2️⃣": pronouns[1],
      "3️⃣": pronouns[2],
      "4️⃣": pronouns[3],
    };

    // Edits the embed with items
    const emojiArray = Object.keys(pronounEmojis);
    let reacting = false;

    function localizeLocale(item: ValidItem, localeSystem?: LocaleSystem) {
      if (item.type === "pronouns" && typeof userconfig[item.id] != "undefined") return pronouns[userconfig[item.id]];
      else if (item.type === "locale" && userconfig[item.id] && localeSystem?.getLocale)
        return localeSystem.getLocale(userconfig[item.id], "NAME");
      else if (item.id === "gayLevel" && userconfig[item.id]) return `${userconfig[item.id]}%`;
      else if (userconfig[item.id]) return userconfig[item.id];
    }

    function editEmbed(localeSystem?: LocaleSystem) {
      const primaryEmbed = {
        embed: {
          title: `👤 ${msg.string("general.PROFILE")}`,
          color: msg.convertHex("general"),
          fields: items.concat([{ emoji: deleteEmoji, label: msg.string("global.DELETE"), type: "delete", id: "delete" }]).map((item) => ({
            name: `${item.emoji} ${localizeProfileItems(msg.string, item.id, true)}`,
            value: localizeLocale(item, localeSystem) || localizeProfileItems(msg.string, item.id),
          })),
          footer: {
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
        },
      };

      return primaryEmbed;
    }

    // Adds the emojis to the items
    const omsg = await msg.channel.createMessage(editEmbed(this.bot.localeSystem));
    async function addEmojis() {
      for await (const item of items) {
        if (!reacting) await omsg.addReaction(item.emoji);
      }
      if (!reacting) await omsg.addReaction(deleteEmoji);
    }

    addEmojis();

    // Waits for a user to give reactions
    await waitFor(
      "messageReactionAdd",
      120000,
      async (m: Message<TextChannel>, emoji: Emoji, user: Member) => {
        if (m.id !== omsg.id) return;
        if (user.id !== msg.author.id) return;
        if (!emoji.name) return;
        if (reacting) return;

        // Deletes a user's config
        if (emoji.name === deleteEmoji) {
          omsg.editEmbed(`❓ ${msg.string("global.CONFIRMATION")}`, msg.string("general.PROFILE_DELETE_CONFIRMATION"));
          // Waits for response
          const { response } = await askYesNo(this.bot, msg.string, msg.author.id, msg.channel.id).catch((err) =>
            timeoutHandler(err, msg, msg.string),
          );
          if (typeof response != "boolean") return;

          // If the user cancels deleting
          if (response === false) {
            return omsg.editEmbed(msg.string("global.CANCELLED"), msg.string("general.PROFILE_CANCELLED_DELETE"), "error");
          }

          // Deletes the config and the askYesNo message
          await this.bot.db.deleteUserConfig(msg.author.id);
          userconfig = { id: msg.author.id };
          omsg.removeReaction(deleteEmoji, user.id);
          omsg.editEmbed(msg.string("global.SUCCESS"), msg.string("general.PROFILE_DELETED"), "success");
          setTimeout(() => {
            omsg.edit(editEmbed(this.bot.localeSystem));
          }, 3000);
        }

        // Finds the setting to use and handles it's reactions
        const setting = items.find((item) => item.emoji === emoji.name);
        if (!setting) return;
        await omsg.removeReaction(setting.emoji, user.id);

        // Handles pronoun selections
        if (setting.type === "pronouns") {
          reacting = true;
          await omsg.removeReactions();
          emojiArray.forEach(async (emoji) => omsg.addReaction(emoji));

          omsg.editEmbed(
            msg.string("general.PROFILE_REACT_PRONOUNS"),
            Object.entries(pronounEmojis)
              .map((p) => `${p[0]}: ${p[1]}`)
              .join("\n"),
          );

          // Waits for message reactions for pronouns
          await waitFor(
            "messageReactionAdd",
            10000,
            async (_m: Message<TextChannel>, _emoji: Emoji, _user: Member) => {
              if (_m.id !== omsg.id) return;
              if (_user.id !== msg.author.id) return;
              if (!emoji.name) return;

              // Gets the pronouns and updates the user's config
              const pronounss = pronouns.indexOf(pronounEmojis[_emoji.name]);
              if (typeof pronounss === "undefined") return;
              userconfig.pronouns = pronounss;
              this.bot.db.updateUserConfig(msg.author.id, userconfig);

              // Cleans up afterwards
              await omsg.edit(editEmbed(this.bot.localeSystem));
              await omsg.removeReactions();
              reacting = false;
              addEmojis();
              return true;
            },

            this.bot,
          ).catch((err) => {
            reacting = false;
            if (err !== "timeout") throw err;
          });
        } else if (setting.type === "locale") {
          reacting = true;
          await askForLocale(omsg, msg, this.bot, userconfig, editEmbed);
          reacting = false;
          addEmojis();
        } else {
          omsg.editEmbed(`👤 ${msg.string("general.PROFILE")}`, msg.string("global.RESPOND_WITH", { type: setting.type }));
          await askForValue(msg, omsg, this.bot, "profile", userconfig, editEmbed, setting);
        }
      },
      this.bot,
    ).catch((err) => timeoutHandler(err, omsg, msg.string));
  }
}
