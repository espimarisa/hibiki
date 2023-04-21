/**
 * @file dysnomia.d.ts
 * @description Extended Hibiki types for Dysnomia
 */

import type { getString } from "./locales.js";

declare module "@projectdysnomia/dysnomia" {
  declare interface CommandInteraction {
    getString: getString;
  }
}
