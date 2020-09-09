/**
 * @fileoverview Logger
 * @description Overrides console.log(); for formatted logging
 * @module logger
 *
 * @example
 * this.bot.log.general("content");
 */

const colors = {
  NC: "\x1b[0m",
  Blue: "\x1b[34m",
  Cyan: "\x1b[36m",
  Green: "\x1b[32m",
  Red: "\x1b[31m",
  White: "\x1b[37m",
  Yellow: "\x1b[33m",
};

const config = {
  date: "Blue",
  error: "Red",
  info: "Cyan",
  general: "Yellow",
  success: "Green",
  warn: "Yellow",
};

// todo: use format.date
function date(syear = true) {
  const date = new Date();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  let day = date.getDate();
  if (day === 1 || day === 21 || day === 31) day = `${date.getDate()}st`;
  else if (day === 2 || day === 22 || day === 32) day = `${date.getDate()}nd`;
  else if (day === 3 || day === 23 || day === 32) day = `${date.getDate()}rd`;
  else day = `${date.getDate()}th`;
  const year = date.getFullYear();
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  return `${colors[config.date]}[${month} ${day}${syear ? ` ${year} ` : " "}${time}]${colors.NC}`;
}

module.exports = args => {
  console.log(`${date(false)} ${colors[config.general]}${args} ${colors.NC}`);
};

module.exports.error = args => {
  console.log(`${date(false)} ${colors[config.error]}${args} ${colors.NC}`);
};

module.exports.info = args => {
  console.log(`${date(false)} ${colors[config.info]}${args} ${colors.NC}`);
};

module.exports.success = args => {
  console.log(`${date(false)} ${colors[config.success]}${args} ${colors.NC}`);
};

module.exports.warn = args => {
  console.log(`${date(false)} ${colors[config.warn]}${args} ${colors.NC}`);
};
