/**
 * @fileoverview Snowflake
 * @description Generates random IDs
 * @module utils/snowflake
 */

/** Generates a snowflake */
export function generateSnowflake() {
  return (Date.now() / 15).toString(36);
}
