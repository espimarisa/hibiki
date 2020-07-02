/**
 * @fileoverview Snowflake
 * @description Generates random IDs
 * @module snowflake
 */

module.exports = {
  /**
   * Creates a random ID
   *
   * @example
   * const { Snowflake } = require("../../utils/snowflake");
   * const id = Snowflake();
   */

  Snowflake: function() {
    return parseInt(Date.now() / 15).toString(36);
  },
};
