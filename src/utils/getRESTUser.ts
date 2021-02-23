/**
 * @file REST User Utility
 * @description Bypasses Eris' REST mode to fetch a User object
 * @module utils/getRESTUser
 */

import type { BaseData } from "eris";
import type { HibikiClient } from "../classes/Client";
import { User } from "eris";

/**
 * Eris' endpoints aren't typed but you can view them here
 * {@link https://github.com/abalabahaha/eris/blob/master/lib/rest/Endpoints.js }
 */

const erisEndpoints = require("eris/lib/rest/Endpoints");

export async function getRESTUser(user: string, bot: HibikiClient) {
  const RESTUser = await bot.requestHandler.request("GET", erisEndpoints.USER(user, true), true).catch(() => {});
  if (!RESTUser) return;
  return new User(RESTUser as BaseData, bot);
}
