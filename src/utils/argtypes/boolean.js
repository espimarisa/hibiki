module.exports = [function bool(a, msg, flag) {
  if (a === "on" || a === "true" || a === "enable" || (flag === "strict" ? a === "yes" : a.startsWith("y"))) return true;
  if (a === "off" || a === "false" || a === "disable" || (flag === "strict" ? a === "no" : a.startsWith("n"))) return false;
}];
