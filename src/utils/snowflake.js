module.exports = {
  Snowflake: function() {
    return parseInt(Date.now() / 15).toString(36);
  },
};
