import type { HibikiClient } from "classes/Client";
import type { Guild } from "eris";
import type { GuildInfo } from "passport-discord";
import { defaultAvatar } from "utils/constants";

export interface TransformedGuild {
  id: GuildInfo["id"];
  name: GuildInfo["name"];
  botJoined: boolean;
  permissions?: GuildInfo["permissions"];
  icon: GuildInfo["icon"];
  iconUrl: string;
}

export const transformGuild = ({ icon, ...guild }: GuildInfo | Guild, bot: HibikiClient): TransformedGuild => ({
  id: guild.id,
  name: guild.name,
  botJoined: bot.guilds.has(guild.id),
  // fuck you typescript, yet again go fuck yourself
  permissions: guild.hasOwnProperty("permissions") && (guild as any).permissions,
  icon: icon ?? "0",
  iconUrl: icon ? `https://cdn.discordapp.com/icons/${guild.id}/${icon}.png?size=64` : defaultAvatar,
});
