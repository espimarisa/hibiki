/*
  This generates random IDs.
*/

module.exports = {
  // Snowflake function
  Snowflake: function() {
    // Creates the snowflake
    return parseInt(Date.now() / 15).toString(36);
  },
};
