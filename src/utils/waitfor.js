/**
 * @fileoverview Wait utility
 * @description Waits for an event/timeout
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
