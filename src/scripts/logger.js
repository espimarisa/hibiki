/*
  This configures how console logging will look.
*/

// Sets console colors
const Colors = {
  // Default styles
  NC: "\x1b[0m",
  Bright: "\x1b[1m",
  Dim: "\x1b[2m",
  Underscore: "\x1b[4m",
  Blink: "\x1b[5m",
  Reverse: "\x1b[7m",
  Hidden: "\x1b[8m",
  // Colors
  Black: "\x1b[30m",
  Red: "\x1b[31m",
  Green: "\x1b[32m",
  Yellow: "\x1b[33m",
  Blue: "\x1b[34m",
  Magenta: "\x1b[35m",
  Cyan: "\x1b[36m",
  White: "\x1b[37m",
  // Background colors
  BgBlack: "\x1b[40m",
  BgRed: "\x1b[41m",
  BgGreen: "\x1b[42m",
  BgYellow: "\x1b[43m",
  BgBlue: "\x1b[44m",
  BgMagenta: "\x1b[45m",
  BgCyan: "\x1b[46m",
  BgWhite: "\x1b[47m",
};

// Logging colors
const ConfigColors = {
  date: "Blue",
  error: "Red",
  info: "Cyan",
  general: "Yellow",
  success: "Green",
  warn: "Yellow",
};

// Date formatter
function date(syear = true) {
  const date = new Date();
  // Sets the month names
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const month = monthNames[date.getMonth()];
  let day = date.getDate();
  // Sets the dates
  if (day === 1 || day === 21 || day === 31) day = `${date.getDate()}st`;
  else if (day === 2 || day === 22 || day === 32) day = `${date.getDate()}nd`;
  else if (day === 3 || day === 23 || day === 32) day = `${date.getDate()}rd`;
  else day = `${date.getDate()}th`;
  const year = date.getFullYear();
  // Gets the date & formats it
  const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
  // Returns formatted date/time
  return `${Colors[ConfigColors.date]}[${month} ${day}${syear ? ` ${year} ` : " "}${time}]${Colors.NC}`;
}

// Exports logging options
module.exports = (args) => {
  console.log(`${date(false)} ${Colors[ConfigColors.general]}${args} ${Colors.NC}`);
};

module.exports.error = (args) => {
  console.log(`${date(false)} ${Colors[ConfigColors.error]}${args} ${Colors.NC}`);
};

module.exports.info = (args) => {
  console.log(`${date(false)} ${Colors[ConfigColors.info]}${args} ${Colors.NC}`);
};

module.exports.success = (args) => {
  console.log(`${date(false)} ${Colors[ConfigColors.success]}${args} ${Colors.NC}`);
};

module.exports.warn = (args) => {
  console.log(`${date(false)} ${Colors[ConfigColors.warn]}${args} ${Colors.NC}`);
};
