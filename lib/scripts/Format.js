/*
  This is used for things that need to
  be formatted more than a few times.
*/

module.exports = {
  // Tags a user by user#disc; replaces emojis if needed
  tag: (user, emojifilter = true) => {
    if (user && emojifilter == true) {
      return `${/[,.\-_a-zA-Z0-9 ]{1,32}/.exec(user.username) !== null ? /[,.\-_a-zA-Z0-9 ]{1,32}/.exec(user.username)[0] : user.id}#${user.discriminator}`;
    } else if (user && emojifilter == false) {
      return `${user.username}#${user.discriminator}`;
    }
    return undefined;
  },

  // Makes dates look nicer
  date: (EpochDate, syear = true) => {
    let date = new Date(EpochDate);
    // Sets the month names
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let month = monthNames[date.getMonth()];
    let day = date.getDate();
    // Sets the dates
    if (day == 1 || day == 21 || day == 31) day = `${date.getDate()}st`;
    else if (day == 2 || day == 22 || day == 32) day = `${date.getDate()}nd`;
    else if (day == 3 || day == 23 || day == 32) day = `${date.getDate()}rd`;
    else day = `${date.getDate()}th`;
    let year = date.getFullYear();
    // Gets the date & formats it
    let time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
    // Returns the formatted date/time
    return `${month} ${day}${syear ? ` ${year} ` : " "}${time}`;
  },
};
