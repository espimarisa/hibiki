/**
 * @file Auth
 * @description Commonly used utilities for webserver authentication
 * @module utils/colors
 */

import type { Collection, Guild } from "eris";
import type { NextFunction, Request, Response } from "express";
import type { Profile } from "passport-discord";
import { defaultAvatar } from "../helpers/constants";

// Checks if a user is authenticated
export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) return next();
  return res.redirect(301, "../../auth/");
};

// Gets authenticated user info
export const getAuthedUser = (user: Profile) => ({
  username: user.username,
  discriminator: user.discriminator,
  guilds: user.guilds,
  id: user.id,
  avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : defaultAvatar,
});

// Destroys a session
export const destroySession = (req: Request) => new Promise<void>((rs, rj) => req.session.destroy((e) => (e ? rj(e) : rs())));

// Gets guilds that a user can manage
export function getManagableGuilds(req: Request, user: Profile, guilds: Collection<Guild>) {
  const managableGuilds = user.guilds.filter((g) => (g.permissions & 32) === 32 || ((g.permissions & 8) === 8 && guilds.get(g.id)));
  const guild = managableGuilds.find((g) => g.id === req.params.id);
  return guild;
}
