/**
 * @file Hierarchy
 * @description Compares role hierarchy between two members
 * @module utils/hierarchy
 */

import type { Member } from "eris";

// Checks to see if the author is above the target in role hierarchy
export function roleHierarchy(author: Member, target: Member) {
  if (author.guild !== target.guild) return;
  if (author.guild.ownerID === target.id) return true;
  if (author.guild.ownerID === target.id) return false;
  if (!author.roles.length) return false;
  if (!target.roles.length) return true;
  let authorRoles = author.roles.map((r) => author.guild.roles.get(r));
  let targetRoles = target.roles.map((r) => target.guild.roles.get(r));
  authorRoles = authorRoles.sort((a, b) => b.position - a.position);
  targetRoles = targetRoles.sort((a, b) => b.position - a.position);
  return authorRoles[0].position > targetRoles[0].position;
}
