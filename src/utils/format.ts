/**
 * @file Format
 * @description Utilities to format various things
 * @module utils/format
 */

import type { User } from "@projectdysnomia/dysnomia";

/**
 * Turns a user object into user#discriminator
 * @param user The user object to tag
 */

export function tagUser(user: User) {
  return `${user.username}#${user.discriminator}`;
}
