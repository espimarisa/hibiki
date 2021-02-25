import type { EmbedField, Message, TextChannel } from "eris";
import { Command } from "../../classes/Command";
import { dateFormat, timeFormat } from "../../utils/format";
import axios from "axios";

export class SteamCommand extends Command {
  description = "Returns information about a Steam profile.";
  requiredkeys = ["steam"];
  args = "<user:string>";
  cooldown = 5000;
  allowdms = true;

  async run(msg: Message<TextChannel>, _pargs: ParsedArgs[], args: string[]) {
    const key = this.bot.config.keys.steam;
    let query = args.join(" ");
    let steamid: string;
    let id;
    let profile: any;
    let bans;
    let games;
    let steamlvl;

    // Vanity URL checker
    if (/^\d+$/.test(args[0])) steamid = query;
    if (query.startsWith("https://steamcommunity.com/id/")) {
      query = args.join(" ").substring("https://steamcommunity.com/id/".length, args.join(" ").length);
    }

    query = encodeURIComponent(query.toLowerCase());

    // Searches by vanity URL
    if (!steamid) {
      id = await axios.get(`http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${key}&vanityurl=${query}`);

      // If nothing was found
      if (!id || !id.data || id.data.response?.success !== 1) {
        return msg.createEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");
      }

      steamid = id.data.response.steamid;
    }

    // Gets summary info
    const steammsg = await msg.createEmbed(`🎮 ${msg.string("utility.STEAM")}`, msg.string("global.PLEASE_WAIT"));
    profile = await axios
      .get(`http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${key}&steamids=${steamid}`)
      .catch(() => {});

    profile = profile && profile.data?.response?.players?.[0] ? profile.data.response.players[0] : null;

    // Gets ban info
    bans = await axios.get(`http://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${key}&steamids=${steamid}`).catch(() => {});
    bans = bans && bans.data.players?.[0] ? bans.data.players[0] : null;

    // Gets owned games
    games = await axios
      .get(
        `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?steamid=${steamid}&include_appinfo=1&include_played_free_games=1&key=${key}`,
      )
      .catch(() => {});

    games = games && games.data?.response ? games.data.response : null;

    // Gets steam level
    steamlvl = await axios
      .get(`https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?steamid=${steamid}&key=${key}`)
      .catch(() => {});

    steamlvl = steamlvl && steamlvl.data?.response?.player_level ? steamlvl.data.response.player_level : null;

    // If the profile has no data
    if (!profile || !bans || !games) return steammsg.editEmbed(msg.string("global.ERROR"), msg.string("utility.ACCOUNT_NOTFOUND"), "error");

    // Formats statuses
    switch (profile.personastate) {
      case 0:
        profile.personastate = msg.string("global.OFFLINE");
        break;
      case 1:
        profile.personastate = msg.string("global.ONLINE");
        break;
      case 2:
        profile.personastate = msg.string("utility.STEAM_BUSY");
        break;
      case 3:
        profile.personastate = msg.string("utility.STEAM_AWAY");
        break;
      case 4:
        profile.personastate = msg.string("utility.STEAM_SNOOZE");
        break;
      case 5:
        profile.personastate = msg.string("utility.STEAM_TRADE");
        break;
      case 6:
        profile.personastate = msg.string("utility.STEAM_PLAY");
        break;
      case undefined:
      default:
        return profile.personastate;
    }

    const fields: EmbedField[] = [];

    // Steam ID
    if (profile.steamid) {
      fields.push({
        name: msg.string("global.ID"),
        value: profile.steamid,
        inline: false,
      });
    }

    // Creation date
    if (profile.timecreated) {
      fields.push({
        name: msg.string("global.CREATED_AT"),
        value: dateFormat(profile.timecreated * 1000, msg.string),
        inline: true,
      });
    }

    // Visibility
    if (profile.personastate) {
      fields.push({
        name: msg.string("logger.VISIBILITY"),
        value: profile.personastate || msg.string("utility.STEAM_PRIVATE"),
        inline: true,
      });
    }

    // Playing game
    if (profile.gameid) {
      profile.gameid = parseInt(profile.gameid);
      const game = games.games?.find?.((game: Record<string, number>) => game?.appid === profile?.gameid);

      if (game) {
        fields.push({
          name: msg.string("global.PLAYING"),
          value: `${game?.name || msg.string("global.NOTHING")}`,
          inline: true,
        });
      }
    }

    // Total games
    if (games.game_count) {
      fields.push({
        name: msg.string("utility.STEAM_GAMES"),
        value: games.game_count,
        inline: true,
      });
    }

    // Level
    if (steamlvl) {
      fields.push({
        name: msg.string("global.LEVEL"),
        value: steamlvl,
        inline: true,
      });
    }

    // Last offline
    if (profile.lastlogoff !== undefined) {
      fields.push({
        name: msg.string("utility.STEAM_OFFLINE"),
        value: msg.string("global.TIME_AGO", { time: timeFormat(new Date().getTime() / 1000 - profile.lastlogoff, msg.string) }),
        inline: true,
      });
    }

    // Country
    if (profile.loccountrycode) {
      fields.push({
        name: msg.string("utility.STEAM_COUNTRY"),
        value: `:flag_${profile.loccountrycode.toLowerCase()}:`,
        inline: true,
      });
    }

    // Real name
    if (profile.realname) {
      fields.push({
        name: msg.string("utility.STEAM_REALNAME"),
        value: profile.realname,
        inline: true,
      });
    }

    let banstring = "";
    if (bans.NumberOfVACBans > 0 || bans.NumberOfGameBans > 0 || bans.EconomyBan !== "none") {
      // VAC bans
      if (bans.NumberOfVACBans > 0) {
        banstring += `✅ ${bans.NumberOfVACBans} ${msg.string("utility.STEAM_VACBANS", { amount: bans.NumberOfVACBans })}\n`;
      } else {
        // No VAC bans
        banstring += `❌ ${msg.string("utility.STEAM_NOVACBANS")}\n`;
      }

      // Game bans
      if (bans.NumberOfGameBans > 0) banstring += `✅  ${msg.string("utility.STEAM_GAMEBANS", { amount: bans.NumberOfGameBans })}\n`;
      else banstring += `❌ ${msg.string("utility.STEAM_NOGAMEBANS")}\n`;

      // Economy bans
      if (bans.EconomyBan !== "none") banstring += `✅ ${msg.string("utility.STEAM_TRADEBANNED", { status: bans.EconomyBan })}\n`;
      else banstring += `❌ ${msg.string("utility.STEAM_NOTTRADEBANNED")}\n`;
    }

    // Bans
    if (banstring.length) {
      fields.push({
        name: msg.string("utility.STEAM_BANSTATUS"),
        value: banstring,
        inline: false,
      });
    }

    // Sends info
    steammsg.edit({
      embed: {
        color: msg.convertHex("general"),
        fields: fields,
        author: {
          name: profile.personaname,
          icon_url: profile.avatarfull,
          url: `https://steamcommunity.com/profiles/${profile.steamid}`,
        },
        thumbnail: {
          url: profile.avatarfull,
        },
        footer: {
          text: `${msg.string("global.RAN_BY", { author: msg.tagUser(msg.author) })}`,
          icon_url: msg.author.dynamicAvatarURL(),
        },
      },
    });
  }
}
