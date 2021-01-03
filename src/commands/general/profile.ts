import type { Emoji, Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { askForValue, askYesNo } from "../../utils/ask";
import { validItems } from "../../utils/validItems";
import { timeoutHandler, waitFor } from "../../utils/waitFor";

const deleteEmoji = "🗑";
const items = validItems.filter((item) => item.category === "profile");
let selectingPronouns = false;

export class ProfileCommand extends Command {
  description = "Updates or views your profile's configuration.";
  aliases = ["usercfg", "userconfig"];
  cooldown = 5000;
  allowdisable = false;

  async run(msg: Message<TextChannel>) {
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

    // Localizes profile items in validItems
    function localizeItems(item: string, title = false) {
      switch (item) {
        case "bio":
          if (title) return msg.string("global.BIO");
          return msg.string("general.PROFILE_BIO_DESCRIPTION");
        case "pronouns":
          if (title) return msg.string("global.PRONOUNS");
          return msg.string("general.PROFILE_PRONOUNS_DESCRIPTION");
        case "timezone":
          if (title) return msg.string("global.TIMEZONE");
          return msg.string("general.PROFILE_TIMEZONE_DESCRIPTION");
        case "timezoneHide":
          if (title) return msg.string("global.TIMEZONEHIDE");
          return msg.string("general.PROFILE_TIMEZONEHIDE_DESCRIPTION");
        case "delete":
          if (title) return msg.string("global.DELETE");
          return msg.string("general.PROFILE_DELETE_DESCRIPTION");
      }
    }

    // Edits the embed with items
    const emojiArray = Object.keys(pronounEmojis);
    function editEmbed() {
      const primaryEmbed = {
        embed: {
          title: `👤 ${msg.string("general.PROFILE")}`,
          color: msg.convertHex("general"),
          fields: (items as Record<string, any>)
            .concat([{ emoji: deleteEmoji, label: msg.string("global.DELETE"), type: "delete", id: "delete" }])
            .map((item: Record<string, string>) => ({
              name: `${item.emoji} ${localizeItems(item.id, true)}`,
              value: userconfig[item.id] || localizeItems(item.id),
            })),
        },
      };

      return primaryEmbed;
    }

    // Adds the emojis to the items
    const omsg = await msg.channel.createMessage(editEmbed());
    function addEmojis() {
      items.forEach((item) => omsg.addReaction(item.emoji));
      omsg.addReaction(deleteEmoji);
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
        if (selectingPronouns) return;

        // Deletes a user's config
        if (emoji.name === deleteEmoji) {
          omsg.editEmbed(`❓ ${msg.string("global.CONFIRMATION")}`, msg.string("general.PROFILE_DELETE_CONFIRMATION"));
          // Waits for response
          const { response } = await askYesNo(this.bot, msg).catch((err) => timeoutHandler(err, omsg, msg.string));
          if (typeof response != "boolean") return;

          // If the user cancels deleting
          if (response === false) {
            return omsg.editEmbed(msg.string("global.CANCELLED"), msg.string("general.PROFILE_CANCEWLLED_DELETE"), "error");
          }

          // Deletes the config and the askYesNo message
          await this.bot.db.deleteUserConfig(msg.author.id);
          userconfig = { id: msg.author.id };
          omsg.removeReaction(deleteEmoji, user.id);
          omsg.editEmbed(msg.string("global.SUCCESS"), msg.string("general.PROFILE_DELETED"), "success");
          setTimeout(() => {
            omsg.edit(editEmbed());
          }, 3000);
        }

        // Finds the setting to use and handles it's reactions
        const setting = items.find((item) => item.emoji === emoji.name);
        if (!setting) return;
        await omsg.removeReaction(setting.emoji, user.id);

        // Handles pronoun selections
        if (setting.type === "pronouns") {
          selectingPronouns = true;
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
              const pronouns = pronounEmojis[_emoji.name];
              if (!pronouns) return;
              userconfig.pronouns = pronouns;
              this.bot.db.updateUserConfig(userconfig);

              // Cleans up afterwards
              await omsg.edit(editEmbed());
              await omsg.removeReactions();
              addEmojis();
              selectingPronouns = false;
              return true;
            },

            this.bot,
          ).catch((err) => {
            selectingPronouns = false;
            if (err !== "timeout") throw err;
          });
        } else {
          omsg.editEmbed(`👤 ${msg.string("general.PROFILE")}`, msg.string("global.RESPOND_WITH", { type: setting.type }));
          await askForValue(msg, omsg, this.bot, "profile", userconfig, editEmbed, setting);
        }
      },
      this.bot,
    ).catch((err) => timeoutHandler(err, omsg, msg.string));
  }
}
