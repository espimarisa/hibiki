import type { Emoji, Member, Message, TextChannel } from "eris";
import type { HibikiClient } from "../../classes/Client";
import { Command } from "../../classes/Command";
import { localizeSetupItems } from "../../helpers/format";
import { askForValue, askYesNo } from "../../utils/ask";
import { validItems } from "../../utils/validItems";
import { timeoutHandler, waitFor } from "../../utils/waitFor";

const categoryEmojis = {
  features: "✨",
  roles: "👥",
  automod: "🔨",
  logging: "📜",
  music: "🎵",
  pinboard: "📌",
  sniping: "🚫",
};

const categories: Record<string, any>[] = [];
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

export class SetupCommand extends Command {
  description = "Edits the bot's config or displays the current one.";
  aliases = ["cfg", "guildconfig", "serverconfig", "setup"];
  allowdisable = false;
  cooldown = 5000;

  async run(msg: Message<TextChannel>): Promise<void> {
    // Gets the guildconfig and inserts a blank one if needed
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig) {
      await this.bot.db.insertBlankGuildConfig(msg.channel.guild.id);
      guildconfig = { id: msg.channel.guild.id };
    }

    if (!guildconfig.invitePunishments) guildconfig.invitePunishments = [];
    if (!guildconfig.spamPunishments) guildconfig.spamPunishments = [];

    // Localizes command categories
    function localizeCategories(category: string) {
      switch (category) {
        case "features":
          return msg.string("global.FEATURES");
        case "roles":
          return msg.string("global.ROLES");
        case "logging":
          return msg.string("global.LOGGING");
        case "sniping":
          return msg.string("global.SNIPING");
        case "pinboard":
          return msg.string("global.PINBOARD");
        case "delete":
          return msg.string("global.DELETE");
        case "music":
          return msg.string("global.MUSIC");
        case "automod":
          return msg.string("global.AUTOMOD");
      }
    }

    // Sends the original message
    const primaryEmbed = {
      embed: {
        title: `🔧 ${msg.string("general.CONFIG")}`,
        color: msg.convertHex("general"),
        fields: categories.concat([{ emoji: deleteEmoji, name: "delete", items: ["delete"] }]).map((cat) => {
          if (!cat.emoji) console.log(cat);
          return {
            name: `${cat.emoji.length > 2 ? "<:" : ""}${cat.emoji}${cat.emoji.length > 2 ? ">" : ""} ${localizeCategories(cat.name)}`,
            value: `${cat.items.map((i: string) => `\`${localizeSetupItems(msg.string, i, true)}\``).join(", ")}`,
          };
        }),
        footer: {
          text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    };
    const omsg = await msg.channel.createMessage(primaryEmbed);

    // Gets a category
    async function getCategory(message: Message, bot: HibikiClient, editMsg: boolean) {
      if (editMsg) {
        message.edit({
          embed: {
            title: `🔧 ${msg.string("general.CONFIG")}`,
            fields: categories.map((cat) => {
              return {
                name: `${cat.emoji} ${localizeCategories(cat.name)})`,
                value: `${cat.items.map((i: string) => `\`${localizeSetupItems(msg.string, i, true)}\``).join(", ")}`,
              };
            }),
            footer: {
              text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
              icon_url: msg.author.dynamicAvatarURL(),
            },
          },
        });
      }

      // Removes all reactions from the message if there are any
      if (Object.getOwnPropertyNames(omsg.reactions).length > 0) await omsg.removeReactions();
      categories.map((cat) => cat.emoji).forEach((catEmoji) => omsg.addReaction(catEmoji));
      omsg.addReaction(deleteEmoji);
      let category: any;

      // Handles deleting a config
      await waitFor(
        "messageReactionAdd",
        120000,
        async (m: Message, emoji: Emoji, user: Member) => {
          if (m.id !== message.id || user.id !== msg.author.id || !emoji.name) return;
          if (emoji.name === deleteEmoji) {
            omsg.editEmbed(`❓ ${msg.string("global.CONFIRMATION")}`, msg.string("general.CONFIG_DELETE_CONFIRMATION"));
            // Waits for response
            const { response } = await askYesNo(bot, msg).catch((err) => timeoutHandler(err, omsg, msg.string));
            if (typeof response != "boolean") return;

            // If the user cancels deleting
            if (response === false) {
              return omsg.editEmbed(msg.string("global.CANCELLED"), msg.string("general.CONFIG_CANCELLED_DELETE"), "error");
            }

            // Deletes the config and the askYesNo message
            await bot.db.deleteGuildConfig(msg.channel.guild.id);
            omsg.removeReaction(deleteEmoji, user.id);
            omsg.editEmbed(msg.string("global.SUCCESS"), msg.string("general.CONFIG_DELETED"), "success");
            setTimeout(() => {
              omsg.edit(primaryEmbed);
            }, 3000);
            return;
          }

          // Finds the category
          category = categories.find((cat) => (cat.emoji.length > 2 ? cat.emoji.split(":")[1] === emoji.id : cat.emoji === emoji.name));
          if (!category) return;
          if (category === "profile") return;
          await m.removeReactions();
          return true;
        },
        bot,
      ).catch((err) => timeoutHandler(err, omsg, msg.string));

      return category;
    }

    // Returns the category items
    function itemsEmbed(category: Record<string, any>) {
      return {
        embed: {
          title: `🔧 ${msg.string("general.CONFIG")}`,
          color: msg.convertHex("general"),
          footer: {
            text: msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: category.items.map((cat: string) => {
            const setting = validItems.find((s) => s.id === cat);
            return {
              name: `${setting.emoji} ${localizeSetupItems(msg.string, setting.id, true)}`,
              value: `${localizeSetupItems(msg.string, setting.id)}`,
              inline: false,
            };
          }),
        },
      };
    }

    // Gets the category and handles category timeouts
    let category = await getCategory(omsg, this.bot, false);
    if (!category || category?.error === "timeout") {
      omsg.editEmbed(msg.string("global.ERROR"), msg.string("global.TIMEOUT_REACHED"), "error");
      return;
    }

    omsg.edit(itemsEmbed(category));
    await omsg.removeReactions();
    await category.items.map(async (cat: string) => omsg.addReaction(validItems.find((s) => s.id === cat).emoji));
    omsg.addReaction(back);

    // Waits for the reaction
    await waitFor(
      "messageReactionAdd",
      60000,
      async (m: Message<TextChannel>, emoji: Emoji, user: Member) => {
        if (user.id !== msg.author.id) return;
        if (m.id !== omsg.id) return;
        if (!emoji.name) return;
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
        if (setting.type === "bool") {
          if (guildconfig[setting.id]) guildconfig[setting.id] = !guildconfig[setting.id];
          else guildconfig[setting.id] = true;

          // Updates the config
          await this.bot.db.updateGuildConfig(guildconfig);
          omsg.editEmbed(
            localizeSetupItems(msg.string, setting.id, true),
            `${setting.id} ${msg.string("global.HAS_BEEN")} **${
              guildconfig[setting.id] ? `${msg.string("global.ENABLED")}` : `${msg.string("global.DISABLED")}`
            }**.`,
            "success",
          );
          setTimeout(() => omsg.edit(itemsEmbed(category)), 2000);
        }

        // Handles punishment types
        else if (setting.type === "punishment") {
          const punishments = { Mute: "1️⃣", Purge: "2️⃣", Warn: "3️⃣" };
          const punishmentDescription = { Mute: null as null, Purge: null as null, Warn: null as null };
          const validpunishments = Object.getOwnPropertyNames(punishments);
          await omsg.removeReactions();

          omsg.editEmbed(
            `🔨 ${msg.string("general.PUNISHMENTS_FOR", { label: localizeSetupItems(msg.string, setting.id, false, true) })}`,
            validpunishments
              .map(
                (p) =>
                  `${punishments[p]} ${p}${punishmentDescription[p] ? punishmentDescription[p] : ""}:` +
                  ` **${guildconfig[setting.id]?.includes(p) ? `${msg.string("global.ENABLED")}` : `${msg.string("global.DISABLED")}`}**`,
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
                await this.bot.db.updateGuildConfig(guildconfig);
                omsg.edit(itemsEmbed(category));
                category.items.map((cat: string) => omsg.addReaction(validItems.find((s) => s.id === cat).emoji));
                omsg.addReaction(back);
                return true;
              }

              // Removes reactions & slices punishments
              omsg.removeReaction(emoji.name, user.id);
              const punishment = validpunishments.find((p) => punishments[p] === emoji.name);
              if (guildconfig[setting.id].includes(punishment)) {
                guildconfig[setting.id].splice(guildconfig[setting.id].indexOf(punishment), 1);
              } else guildconfig[setting.id].push(punishment);

              // Sends punishment toggle message
              omsg.editEmbed(
                `🔨 ${msg.string("general.PUNISHMENTS_FOR", { label: localizeSetupItems(msg.string, setting.id, false, true) })}`,
                validpunishments
                  .map(
                    (p) =>
                      `${punishments[p]} ${p}${punishmentDescription[p] ? punishmentDescription[p] : ""}: **${
                        guildconfig[setting.id].includes(p) ? `${msg.string("global.ENABLED")}` : `${msg.string("global.DISABLED")}`
                      }**`,
                  )
                  .join("\n"),
              );
            },
            this.bot,
          ).catch((err) => timeoutHandler(err, omsg, msg.string));
        }

        // Asks for a response if it's anything else
        else {
          omsg.editEmbed(`🔧 ${msg.string("general.CONFIG")}`, `${msg.string("global.RESPOND_WITH", { type: setting.type })}`);
          askForValue(msg, omsg, this.bot, category, guildconfig, itemsEmbed, setting);
        }
      },

      this.bot,
    ).catch((err) => timeoutHandler(err, omsg, msg.string));

    // Deletes & reruns the command
    if (category.repeat) {
      omsg.delete();
      return this.run(msg);
    }
  }
}
