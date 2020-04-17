/*
  This is used for things that need to
  be formatted more than a few times.
*/

module.exports = {
  // Tags a member by user#disc; replaces emojis if needed
  tag: (user, emojifilter = true) => {
    if (user && emojifilter === true) {
      return `${/[,.\-_a-zA-Z0-9]{1,32}/.exec(user.username) !== null ? /[,.\-_a-zA-Z0-9]{1,32}/.exec(user.username)[0] : user.id}#${user.discriminator}`;
    } else if (user && emojifilter === false) {
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
    if (day === 1 || day === 21 || day === 31) day = `${date.getDate()}st`;
    else if (day === 2 || day === 22 || day === 32) day = `${date.getDate()}nd`;
    else if (day === 3 || day === 23 || day === 32) day = `${date.getDate()}rd`;
    else day = `${date.getDate()}th`;
    let year = date.getFullYear();
    // Gets the date & formats it
    let time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
    // Returns the formatted date/time
    return `${month} ${day}${syear ? ` ${year} ` : " "}${time}`;
  },

  // Formats dates
  dateParse: (time, options = {
    hours: true,
    days: true,
    months: true,
    years: true,
    autohide: true,
  }) => {
    // Sets constants for date parsing
    if (!time) return undefined;
    let finalstring = "";
    let hour;
    let day;
    let month;
    let year;
    // Parses hours
    if (options.hours) {
      hour = time / 3600;
      if (options.autohide === true) finalstring = `${hour.toFixed(1)} hours`;
      if (!options.autohide) finalstring += `${hour.toFixed(1)} hours `;
    }

    // Parses days
    if (options.days) {
      day = time / 86400;
      if (hour > 24 && options.autohide === true) finalstring = `${day.toFixed(1)} days`;
      if (!options.autohide) finalstring += `${day.toFixed(0)} days `;
    }

    // Parses months
    if (options.months) {
      month = time / 2592000;
      if (day > 31 && options.autohide === true) finalstring = `${month.toFixed(1)} months`;
      if (!options.autohide) finalstring += `${month.toFixed(0)} months `;
    }

    // Parses years
    if (options.years) {
      year = time / 32140800;
      if (month > 12 && options.autohide === true) finalstring = `${year.toFixed(2)} years`;
      if (!options.autohide) finalstring += `${year.toFixed(0)} years`;
    }
    return finalstring;
  },

  // Formats time left in a day
  day: (ms) => {
    let d, h, m, s;
    s = Math.floor(ms / 1000);
    m = Math.floor(s / 60);
    s %= 60;
    h = Math.floor(m / 60);
    m %= 60;
    d = Math.floor(h / 24);
    h %= 24;
    h += d * 24;
    return `${h} hours and ${m} minutes`;
  },
};
