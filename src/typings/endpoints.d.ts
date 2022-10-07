/**
 * @file Endpoints
 * @description Typings for external API endpoints
 * @typedef endpoints
 */

/**
 * Image from api.nekobot.xyz
 */

interface NekobotImage {
  message: string;
  success: boolean;
  version: string;
}

/**
 * Image from nekos.life
 */

interface NekosLifeImage {
  msg?: string;
  url?: string;
}

/**
 * A word from the Urban Dictionary
 */

interface UrbanWord {
  definition: string;
  permalink: string;
  thumbs_up: number;
  sound_urls: string[];
  author: string;
  word: string;
  defid: number;
  current_vote: string;
  written_on: Date;
  example: string;
  thumbs_down: number;
}
