/**
 * @file Auth
 * @description Utilities for the webserver's authentication
 * @module web/utils/auth
 */

import type { OAuth2Token } from "fastify-oauth2";
import fetch from "cross-fetch";

/**
 * Gets a user's profile via an Oauth2 token
 * @param token A valid Oauth2 token
 * @returns An authed user profile
 */

export async function getOauthUserProfile(token: OAuth2Token) {
  const body = await fetch("https://discord.com/api/users/@me", {
    method: "GET",
    headers: {
      authorization: `${token.token_type} ${token.access_token}`,
    },
  });

  const response = await body.json();

  if (!response) return;
  return response;
}
