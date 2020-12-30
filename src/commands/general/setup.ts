import type { HibikiClient } from "classes/Client";
import type { Member, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { askFor } from "../../utils/ask";
import { validItems } from "../../utils/items";
import { waitFor } from "../../utils/waitFor";

const categoryEmojis = {
  Features: "✨",
  Roles: "👥",
  Automod: "🔨",
  Logging: "📜",
};

const typeLabels = {
  channelID: "Channel",
  roleID: "Role",
  bool: "Toggle",
  number: "Number",
  emoji: "Emoji",
  roleArray: "Roles",
  channelArray: "Channels",
  string: "Text",
  punishment: "Punishment",
};

const categories: any[] = [];
const back = "⬅️";
const submit = "☑";

validItems.forEach((s) => {
  const cat = categories.find((c) => c.name === s.category);
  if (!s.category) return;
  if (s.category === "Profile") return;
  if (!cat) categories.push({ name: s.category, emoji: categoryEmojis[s.category], items: [s.id] });
  else {
    cat.items.push(s.id);
    categories.forEach((c) => categories.find((cc) => cc.id === c.id) || c);
  }
});

export class SetupCommand extends Command {
  description = "Edits the bot's config or displays the current one.";
  aliases = ["cfg", "config", "guildconfig"];
  allowdisable = false;
  cooldown = 5000;

  async run(msg: Message<TextChannel>): Promise<void> {
    // Gets the guildconfig and inserts a blank one if needed
    let guildconfig = await this.bot.db.getGuildConfig(msg.channel.guild.id);
    if (!guildconfig) {
      await this.bot.db.db
        .table("guildconfig")
        .insert({
          id: msg.channel.guild.id,
        })
        .run();

      guildconfig = { id: msg.channel.guild.id };
    }

    const omsg = await msg.channel.createMessage({
      embed: {
        title: "aaaaa",
        color: msg.convertHex("general"),
        fields: categories.map((cat) => {
          return {
            name: `${cat.emoji.length > 2 ? "<:" : ""}${cat.emoji}${cat.emoji.length > 2 ? ">" : ""} ${cat.name}`,
            value: `${cat.items.map((i: any) => `\`${i}\``).join(", ")}`,
          };
        }),
      },
    });

    async function getCategory(message: Message, bot: HibikiClient, editMsg: boolean) {
      if (editMsg) {
        message.edit({
          embed: {
            // todo add locale shit and footer
            title: "🔧 Setup",
            fields: categories.map((cat) => {
              return {
                name: `${cat.emoji} ${cat.name}`,
                value: `${cat.items.map((i: any) => `\`${i}\``).join(", ")}`,
              };
            }),
          },
        });
      }

      // Removes all reactions from the message if there are any
      if (Object.getOwnPropertyNames(message.reactions).length > 0) await message.removeReactions();
      categories.map((cat) => cat.emoji).forEach((catEmoji) => message.addReaction(catEmoji));
      let category: any;
      const stop = false;

      // Waits for a reaction
      await waitFor(
        "messageReactionAdd",
        120000,
        async (m: Message, emoji: any, user: Member) => {
          if (m.id !== message.id || user.id !== msg.author.id || !emoji.name || stop) return;
          category = categories.find((cat) => (cat.emoji.length > 2 ? cat.emoji.split(":")[1] === emoji.id : cat.emoji === emoji.name));
          if (!category) return;
          if (category === "Profile") return;
          await m.removeReactions();
          return true;
        },
        bot,
      );

      return category;
    }

    // Returns the category items
    function itemsEmbed(category: any, bot: HibikiClient) {
      return {
        embed: {
          title: "🔧 Setup",
          color: msg.convertHex("general"),
          footer: {
            text: msg.string("global.RAN_BY", { author: bot.tagUser(msg.author) }),
            icon_url: msg.author.dynamicAvatarURL(),
          },
          fields: category.items.map((cat: any) => {
            const setting = validItems.find((s) => s.id === cat);
            return {
              name: `${setting.emoji} ${setting.label}`,
              value: typeLabels[setting.type] || setting.type,
              inline: true,
            };
          }),
        },
      };
    }

    // Gets the category
    let category = await getCategory(omsg, this.bot, false);
    if (category.error === "timeout") {
      omsg.editEmbed(msg.string("global.ERROR"), msg.string("global.TIMEOUT_REACHED"), "error");
    }

    // ignore ts ill fix it later
    omsg.edit(itemsEmbed(category, this.bot));
    await omsg.removeReactions();
    await category.items.map(async (cat: string) => omsg.addReaction(validItems.find((s) => s.id === cat).emoji));
    omsg.addReaction(back);

    // Waits for the reaction
    await waitFor(
      "messageReactionAdd",
      60000,
      async (m: Message<TextChannel>, emoji: any, user: Member) => {
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
        if (!setting) return;
        if (setting.category === "Profile") return;

        // Removes reaction & updates
        omsg.removeReaction(emoji.name, user.id);
        let cooldown = 0;

        /** Handles booleans */
        if (setting.type === "bool") {
          if (guildconfig[setting.id]) guildconfig[setting.id] = !guildconfig[setting.id];
          else guildconfig[setting.id] = true;

          // todo: db shit
          await this.bot.db.updateGuildConfig(guildconfig);
          // todo: localisations
          omsg.editEmbed(setting.label, `${setting.id} has been **${guildconfig[setting.id] ? "enabled" : "disabled"}**.`, "success");
          setTimeout(() => omsg.edit(itemsEmbed(category, this.bot)), 1500);
        }

        // handles punishment shit
        // ugly as hell but idc
        else if (setting.type === "punishment") {
          const punishments = { Mute: "1️⃣", Purge: "2️⃣", Warn: "3️⃣" };
          // @ts-expect-error
          const punishmentDescription = { Mute: null, Purge: null, Warn: null };
          const validpunishments = Object.getOwnPropertyNames(punishments);
          await omsg.removeReactions();

          omsg.editEmbed(
            `🔨 Punishments for ${setting.label}`,
            validpunishments
              .map(
                (p) =>
                  // fuck off formatter
                  // prettier-ignore
                  `${punishments[p]} ${p}${punishmentDescription[p] ? punishmentDescription[p] : ""}:` +` **${guildconfig[setting.id].includes(p) ? "enabled" : "disabled"}**`,
              )
              .join("\n"),
          );

          validpunishments.forEach((p) => omsg.addReaction(punishments[p]));
          omsg.addReaction(submit);

          // waits for more shit
          await waitFor(
            "messageReactionAdd",
            60000,
            async (m: Message, emoji: any, user: string) => {
              if (m.id !== omsg.id) return;
              if (user !== msg.author.id) return;
              if (!emoji.name) return;

              // submission shit
              if (emoji.name === submit) {
                await omsg.removeReactions();
                await this.bot.db.updateGuildConfig(guildconfig);
                omsg.edit(itemsEmbed(category, this.bot));
                category.items.map((cat: string) => omsg.addReaction(validItems.find((s) => s.id === cat).emoji));
                omsg.addReaction(back);
                return true;
              }

              // Removes reactions & shit
              omsg.removeReaction(emoji.name, user);
              const punishment = validpunishments.find((p) => punishments[p] === emoji.name);
              if (guildconfig[setting.id].includes(punishment)) {
                guildconfig[setting.id].splice(guildconfig[setting.id].indexOf(punishment), 1);
              } else guildconfig[setting.id].push(punishment);

              omsg.editEmbed(
                // @ts-expect-error idc fag
                `🔨 Punishments for ${setting?.pickerLabel}`,
                validpunishments
                  .map(
                    (p) =>
                      `${punishments[p]} ${p}${punishmentDescription[p] ? punishmentDescription[p] : ""}: **${
                        guildconfig[setting.id].includes(p) ? "enabled" : "disabled"
                      }**`,
                  )
                  .join("\n"),
              );
            },
            this.bot,
          );
        }

        // idk bro does shitt ig
        else {
          omsg.editEmbed("🔧 Setup", `Respond with the desired **${setting.type}**. You have **60 seconds** to respond.`);
          // I LOVE WAITFOR! 5 WAITFORS SO COOl!!!
          await waitFor(
            "messageCreate",
            60000,
            async (m: Message) => {
              if (m.author.id !== msg.author.id || m.channel.id !== msg.channel.id || !msg.content) return;
              let result = askFor(setting.type, m.content, msg.channel.guild);
              if ((setting.type !== "bool" && !result) || (typeof result === "string" && result.startsWith("No"))) {
                const errormsg = await msg.createEmbed(
                  "❌ Error",
                  // prettier-ignore
                  `Invalid ${setting.type}${Math.abs(cooldown - 2) === 0 ? "" : `; **${Math.abs(cooldown - 2)}** attempts left before exiting.`}`,
                  "error",
                );

                cooldown++;
                setTimeout(() => {
                  errormsg.delete();
                }, 1000);

                // If cooldown reached
                if (cooldown > 2) {
                  omsg.edit(itemsEmbed(category, this.bot));
                  return true;
                }

                return;
              }

              // Checks limits
              if (setting.type === "roleArray" && setting.maximum && result.length > setting.maximum) {
                return msg.createEmbed("❌ Error", `You can't set more than ${setting.maximum} roles.`, "error");
              }

              if (setting.type === "channelArray" && setting.maximum && result.length > setting.maximum) {
                return msg.createEmbed("❌ Error", `You can't set more than ${setting.maximum} channels.`, "error");
              }

              // Number comparisons
              if (
                setting.type === "number" &&
                setting.maximum &&
                setting.maximum &&
                (setting.minimum > (await result) || setting.maximum < result)
              ) {
                return msg.createEmbed("❌ Error", `The number needs to be under ${setting.maximum} and over ${setting.minimum}.`, "error");
              }

              // Clear handler
              if ((await result) === "clear") result = null;
              guildconfig[setting.id] = result;
              await this.bot.db.updateGuildConfig(guildconfig);

              m.delete();
              const setmsg = await msg.createEmbed("✅ Success", `**${setting.id}** has been set to **${result}**.`, "success");
              setTimeout(() => {
                setmsg.delete();
              }, 2000);
              omsg.edit(itemsEmbed(category, this.bot));
              return true;
            },

            this.bot,
          );
        }
      },

      this.bot,
    );

    // Deletes & reruns the command
    if (category.repeat) {
      omsg.delete();
      return this.run(msg);
    }
  }
}
