import type { APIGuild } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

// Gets an array of guilds a user is in
export async function getAPIGuilds(accessToken: string, authPrefix: "Bearer" | "Bot" = "Bearer") {
  const rest = new REST({
    authPrefix: authPrefix,
    version: "10",
  }).setToken(accessToken);

  // Fetches the guilds
  const guilds = (await rest.get(Routes.userGuilds())) as APIGuild[] | undefined;
  if (!guilds?.length) return;
  return guilds;
}
