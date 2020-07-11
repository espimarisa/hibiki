/**
 * @fileoverview waitFor
 * @description Waits for an event to happen and acts on it
 * @module waitFor
 */

/**
 * Waits for an event to happen; runs a function
 * @param {string} event The bot event to wait for
 * @param {number} timeout Wait timeout, in ms
 * @param {Function} check The function to run when triggered
 * @param {object} bot Main bot object
 *
 * @async
 * @example
 * const waitFor = require("../../utils/waitFor");
 * await waitFor("messageCreate", 1000, async (msg) => {
 *   console.log(msg.content);
 * }, this.bot)
 */

module.exports = (event, timeout, check, bot) => {
  let t;
  if (!check || typeof check !== "function") check = () => true;
  return new Promise((rs, rj) => {
    const listener = async (...args) => {
      const finalCheck = await check(...args);
      if (check && typeof check === "function" && finalCheck) {
        dispose();
        rs([...args]);
      }
    };

    // Removes listeners
    const dispose = () => {
      bot.removeListener(event, listener);
      if (t) clearTimeout(t);
    };

    // Timeouts
    if (timeout) {
      t = setTimeout(() => {
        dispose();
        rj("timeout");
      }, timeout);
    }

    bot.on(event, listener);
  });
};
