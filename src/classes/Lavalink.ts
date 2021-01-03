import type { Member, User, VoiceChannel } from "eris";
import type { HibikiClient } from "./Client";
import { Manager } from "erela.js";
import { convertHex } from "../helpers/embed";
import { tagUser, toHHMMSS } from "../helpers/format";
import Spotify from "erela.js-spotify";
import config from "../../config.json";
let plugins: Spotify[];

// Only load Spotify plugin if both a ID and secret are given
if (config.lavalink.spotifyClientID && config.lavalink.spotifyClientSecret) {
  plugins = [
    new Spotify({
      clientID: config.lavalink.spotifyClientID,
      clientSecret: config.lavalink.spotifyClientSecret,
    }),
  ];
}

export class Lavalink {
  manager: Manager;
  eventHandler: (m: Member, channel: VoiceChannel, oldchannel: VoiceChannel) => void;

  /** Creates a new Lavalink manager */
  constructor(bot: HibikiClient) {
    this.manager = new Manager({
      plugins: plugins,
      autoPlay: true,

      nodes: [
        {
          retryAmount: 2,
          host: config.lavalink.host ? config.lavalink.host : "localhost",
          port: config.lavalink.port ? config.lavalink.port : 2333,
          password: config.lavalink.password ? config.lavalink.password : "youshallnotpass",
        },
      ],

      /** Sends payload data to a guild */
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
        const userLocale = await bot.localeSystem.getUserLocale(`${requester}`, bot);
        const string = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;
        if (p.trackRepeat) return;

        bot
          .createMessage(p.options.textChannel, {
            embed: {
              title: `🎶 ${string("music.NOW_PLAYING")}`,
              description: string("music.NOW_PLAYING_INFO", {
                track: title,
                url: uri,
                author: author,
              }),
              color: convertHex("general"),
              fields: [
                {
                  name: string("music.DURATION"),
                  value: `${toHHMMSS(p.queue.current?.duration / 1000)}`,
                  inline: true,
                },
              ],
              image: {
                url: thumbnail ? thumbnail : undefined,
              },
              footer: {
                text: string("music.REQUESTED_BY_FOOTER", { requester: tagUser(requester as User) }),
                icon_url: bot.user.dynamicAvatarURL(),
              },
            },
          })
          .then((m) => {
            setTimeout(() => {
              m.delete();
            }, 15000);
          });
      })

      // Handles queue ending
      .on("queueEnd", async (player, { requester }) => {
        // Finds the locale
        const userLocale = await bot.localeSystem.getUserLocale(`${requester}`, bot);
        const string = bot.localeSystem.getLocaleFunction(userLocale) as LocaleString;

        bot.createMessage(player.options.textChannel, {
          embed: {
            title: `⏹ ${string("music.STOPPED")}`,
            description: string("music.END_OF_QUEUE"),
            color: convertHex("general"),
            footer: {
              text: string("music.REQUESTED_BY_FOOTER", { requester: tagUser(requester as User) }),
              icon_url: bot.user.dynamicAvatarURL(),
            },
          },
        });

        player.destroy();
      });

    // Sends the actual websocket
    bot.on("rawWS", (data: any) => bot.lavalink.manager.updateVoiceState(data));

    // Leaves the voice channel and kills the queue if alone or moved in a channel
    this.eventHandler = (member: Member, channel: VoiceChannel, oldchannel: VoiceChannel) => {
      // Gets the player
      const player = this.manager.players.get(channel.guild.id);
      if (!player) return;
      let userCount = 0;

      // Gets the voice channel and the member amount in it
      const currentChannel = channel.guild.channels.get(player.options.voiceChannel) as VoiceChannel;
      currentChannel?.voiceMembers.forEach((m) => (m.user.id === bot.user.id ? null : userCount++));

      // Disconnects and destroys the player if the channel is empty or only has the bot in it
      if (userCount === 0 || (member.id === bot.user.id && oldchannel)) {
        if (player) {
          player.disconnect();
          player.destroy();
        }
      }
    };

    // Listens on channel leave, join, and move
    bot.on("voiceChannelLeave", this.eventHandler);
    bot.on("voiceChannelJoin", this.eventHandler);
    bot.on("voiceChannelSwitch", this.eventHandler);
  }
}
