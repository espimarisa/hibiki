/**
 * @file Format
 * @description Utilities to format or cleanup various things
 */

import type { User } from "@projectdysnomia/dysnomia";

// Turns a user object into user#discriminator
export function tagUser(user: User) {
  return `${user.username}#${user.discriminator}`;
}
