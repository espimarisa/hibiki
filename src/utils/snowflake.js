/*
  Snowflake Function
  This generates random IDs for use in commands.
*/

module.exports = {
  // Snowflake function
  Snowflake: function() {
    // Creates the snowflake
    return BigInt(parseInt(Date.now() / 15)).toString(36);
  },
};
