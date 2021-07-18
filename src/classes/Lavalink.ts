/**
 * @file Lavalink
 * @description Handles music-related features
 */

import type { Member, User, VoiceChannel } from "eris";
import type { Plugin, VoicePacket } from "erela.js";

import type { HibikiClient } from "./Client";

import { Manager } from "erela.js";

import { convertHex } from "../utils/embed";
import { tagUser, toHHMMSS } from "../utils/format";

import Spotify from "@sysdotini/erela.js-spotify";

import config from "../../config.json";

const PLUGINS: Plugin[] = [];

// Only load Spotify plugin if both a ID and secret are given
if (config.lavalink?.spotifyClientID && config.lavalink?.spotifyClientSecret) {
  PLUGINS.push(
    new Spotify({
      clientID: config.lavalink.spotifyClientID,
      clientSecret: config.lavalink.spotifyClientSecret,
    }),
  );
}

export class Lavalink {
  readonly manager: Manager;
  readonly eventHandler: (m: Member, channel: VoiceChannel, oldchannel: VoiceChannel) => void;

  // Creates a new lavalink manager
  constructor(bot: HibikiClient) {
    this.manager = new Manager({
      plugins: PLUGINS,
      autoPlay: true,

      nodes: [
        {
          retryAmount: 2,
          host: config.lavalink?.host ?? "localhost",
          port: config.lavalink?.port ?? 2333,
          password: config.lavalink?.password ?? "youshallnotpass",
        },
      ],

      // Sends payload data to a guild
      send(id, payload) {
        const guild = bot.guilds.get(id);
        if (guild) guild.shard.sendWS(payload.op, payload.d);
      },
    })

      // Handles connections and errors
      .on("nodeConnect", (node) => bot.log.info(`Lavalink node ${node.options.identifier} is ready on port ${node.options.port}`))
      .on("nodeError", (node, err) => bot.log.error(`Lavalink node ${node.options.identifier} encountered an error: ${err}`))
      .on("trackStart", async (p, { title, author, thumbnail, requester, uri }) => {
        // Finds the locale
        const locale = bot.localeSystem.getLocaleFunction(await bot.localeSystem.getUserLocale(String(requester)));
        if (p.trackRepeat) return;

        bot
          .createMessage(p.options.textChannel, {
            embed: {
              title: `🎶 ${locale("music.NOW_PLAYING")}`,
              description: locale("music.NOW_PLAYING_INFO", {
                track: title,
                url: uri,
                author: author,
              }),
              color: convertHex("general"),
              fields: [
                {
                  name: locale("music.DURATION"),
                  value: `${toHHMMSS(p.queue.current?.duration / 1000)}`,
                  inline: true,
                },
              ],
              image: {
                url: thumbnail ? thumbnail : undefined,
              },
              footer: {
                text: locale("music.REQUESTED_BY_FOOTER", { requester: tagUser(requester as User) }),
                icon_url: bot.user.dynamicAvatarURL(),
              },
            },
          })
          .then((m) => {
            setTimeout(async () => {
              await m.delete().catch(() => {});
            }, 15000);
          });
      })

      // Handles queue ending
      .on("queueEnd", async (player, { requester }) => {
        // Finds the locale
        const locale = bot.localeSystem.getLocaleFunction(await bot.localeSystem.getUserLocale(String(requester)));

        bot.createMessage(player.options.textChannel, {
          embed: {
            title: `⏹ ${locale("music.STOPPED")}`,
            description: locale("music.END_OF_QUEUE"),
            color: convertHex("general"),
            footer: {
              text: locale("music.REQUESTED_BY_FOOTER", { requester: tagUser(requester as User) }),
              icon_url: bot.user.dynamicAvatarURL(),
            },
          },
        });

        player.destroy();
      });

    // Sends the actual websocket
    bot.on("rawWS", (data: VoicePacket) => bot.lavalink.manager.updateVoiceState(data));

    // Listens on channel leave, join, and move
    // Leaves the voice channel and kills the queue if alone or moved in a channel
    ["Leave", "Join", "Switch"].map((x) =>
      bot.on(`voiceChannel${x}`, (member: Member, channel: VoiceChannel, oldChannel: VoiceChannel) => {
        // Gets the player
        const player = this.manager.players.get(channel.guild.id);
        if (!player) return;
        let userCount = 0;

        // Gets the voice channel and the member amount in it
        const currentChannel = channel.guild.channels.get(player.options.voiceChannel) as VoiceChannel;
        currentChannel?.voiceMembers.forEach((m) => (m.user.id === bot.user.id ? null : userCount++));

        // Disconnects and destroys the player if the channel is empty or only has the bot in it
        if (userCount === 0 || (member.id === bot.user.id && oldChannel)) {
          player?.stop();
          player?.destroy();
          // player?.disconnect();
          // currentChannel.leave();
        }
      }),
    );
  }
}
