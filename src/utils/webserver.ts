/**
 * @file Webserver
 * @description Commonly used utilities for the webserver
 * @module utils/webserver
 */

import type { Collection, Guild } from "eris";
import type { NextFunction, Request, Response } from "express";
import type { Liquid } from "liquidjs";
import type { Profile } from "passport-discord";
import { readdirSync } from "fs";
import { defaultAvatar } from "./constants";
import path from "path";

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

// Enables directly serving font awesome icons
export function loadIcons(engine: Liquid) {
  const icons = {};
  const MODULES_DIRECTORY = path.resolve(
    __dirname,
    process.env.NODE_ENV === "development" ? "../../node_modules" : "../../../node_modules",
  );

  // Loads icon SVG files from font awesome
  const iconPackages = ["@fortawesome/free-solid-svg-icons", "@fortawesome/free-brands-svg-icons"];
  iconPackages.forEach((pkg) => {
    const iconDirectory = path.join(MODULES_DIRECTORY, pkg);
    const files = readdirSync(iconDirectory, { withFileTypes: true });
    files.forEach((file) => {
      if (file.isDirectory()) return;
      if (!file.name.startsWith("fa") || !file.name.endsWith(".js")) return;
      const icon = require(path.join(pkg, file.name));
      // Sets the icon SVG, width, and height
      icons[icon.iconName] = {
        svg: icon.svgPathData,
        width: icon.width,
        height: icon.height,
      };
    });
  });

  // Custom icon tag
  engine.registerFilter(
    "icon",
    (arg: string) =>
      `<svg width="100%" height="100%" preserveAspectRatio="xMidYMid meet" viewBox="0 0 ${icons[arg].width} ${icons[arg].height}"><path d="${icons[arg].svg}" /></svg>`,
  );
}
