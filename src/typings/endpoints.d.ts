/**
 * @file Endpoints
 * @description Typings for external API endpoints
 * @typedef endpoints
 */

/**
 * Image from api.nekobot.xyz
 */

interface NekobotImage extends Response {
  message: string;
  success: boolean;
  version: string;
}

/**
 * Image from nekos.life
 */

interface NekosLifeImage extends Response {
  msg?: string;
  url?: string;
}
