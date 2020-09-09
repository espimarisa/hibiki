/**
 * @fileoverview Format
 * @description Formats & beautifies items
 * @module format
 */

module.exports = {

  /**
   * Tags a user by user#discrim
   * @example format.tag(msg.author);
   *
   * @param {object} user Discord user object
   * @param {boolean} [emojifilter] Removes emojis and spaces from the tag, disabled by default
   */

  tag: (user, emojifilter = false) => {
    if (user && emojifilter) {
      return `${/[,.\-_a-zA-Z0-9]{1,32}/.exec(user.username) !== null ?
      /[,.\-_a-zA-Z0-9]{1,32}/.exec(user.username)[0] : user.id}#${user.discriminator}`;
    } else if (user && !emojifilter) {
      return `${user.username}#${user.discriminator}`;
    }
    return;
  },

  /**
   * Formats dates to be prettier
   * @example format.date(new Date());
   *
   * @param {number} EpochDate Date, in Epoch format
   * @param {boolean} [syear] Whether or not to output the year
   */

  date: (EpochDate, syear = true) => {
    const date = new Date(EpochDate);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = monthNames[date.getMonth()];
    let day = date.getDate();
    if (day === 1 || day === 21 || day === 31) day = `${date.getDate()}st`;
    else if (day === 2 || day === 22 || day === 32) day = `${date.getDate()}nd`;
    else if (day === 3 || day === 23 || day === 32) day = `${date.getDate()}rd`;
    else day = `${date.getDate()}th`;
    const year = date.getFullYear();
    const time = `${(date.getHours() < 10 ? "0" : "") + date.getHours()}:${(date.getMinutes() < 10 ? "0" : "") + date.getMinutes()}`;
    return `${month} ${day}${syear ? ` ${year} ` : " "}${time}`;
  },

  /**
   * Formats how long ago a date was
   * @example format.dateParse(new Date() / 1000 - timestamp / 1000);
   *
   * @param {Number} time The timestamp to format
   * @param {Boolean} [options] Toggle what to format
   */

  dateParse: (time, options = {
    hours: true,
    days: true,
    months: true,
    years: true,
    autohide: true,
  }) => {
    if (!time) return;
    let finalstring = "";
    let hour;
    let day;
    let month;
    let year;

    if (options.hours) {
      hour = time / 3600;
      if (options.autohide) finalstring = `${hour.toFixed(1)} hours`;
      if (!options.autohide) finalstring += `${hour.toFixed(1)} hours `;
    }

    if (options.days) {
      day = time / 86400;
      if (hour > 24 && options.autohide) finalstring = `${day.toFixed(1)} days`;
      if (!options.autohide) finalstring += `${day.toFixed(0)} days `;
    }

    if (options.months) {
      month = time / 2592000;
      if (day > 31 && options.autohide) finalstring = `${month.toFixed(1)} months`;
      if (!options.autohide) finalstring += `${month.toFixed(0)} months `;
    }

    if (options.years) {
      year = time / 32140800;
      if (month > 12 && options.autohide) finalstring = `${year.toFixed(2)} years`;
      if (!options.autohide) finalstring += `${year.toFixed(0)} years`;
    }

    return finalstring;
  },

  /**
   * Formats Nitro Boost guild features
   * @example format.features(guild.features).join(", ")
   *
   * @param {object} features Guild features object
   */

  features: features => {
    if (!features) return undefined;
    return features.map(feature => {
      switch (feature) {
        case "COMMUNITY":
          return "Community";
        case "WELCOME_SCREEN_ENABLED":
          return "Welcome Screen Enabled";
        case "INVITE_SPLASH":
          return "Invite Splash";
        case "VANITY_URL":
          return "Vanity URL";
        case "ANIMATED_ICON":
          return "Animated Icon";
        case "PARTNERED":
          return "Partnered";
        case "VERIFIED":
          return "Verified";
        case "VIP_REGIONS":
          return "High Bitrate Voice Channel";
        case "PUBLIC":
          return "Public";
        case "LURKABLE":
          return "Lurkable";
        case "COMMERCE":
          return "Commerce Features";
        case "NEWS":
          return "News Channel";
        case "DISCOVERABLE":
          return "Searchable";
        case "FEATURABLE":
          return "Featured";
        case "BANNER":
          return "Banner";
        default:
          return feature;
      }
    });
  },

  /**
   * Formats voice regions with their respective flags
   * @example format.region(guild.region);
   *
   * @param {string} region The server region to format
   */

  region(region) {
    switch (region) {
      case "amsterdam":
        return "Amsterdam";
      case "brazil":
        return "Brazil";
      case "eu-central":
        return "Central Europe";
      case "eu-west":
        return "Western Europe";
      case "europe":
        return "Europe";
      case "dubai":
        return "Dubai";
      case "frankfurt":
        return "Frankfurt";
      case "hongkong":
        return "Hong Kong";
      case "london":
        return "London";
      case "japan":
        return "Japan";
      case "india":
        return "India";
      case "russia":
        return "Russia";
      case "singapore":
        return "Singapore";
      case "southafrica":
        return "South Africa";
      case "south-korea":
        return "South Korea";
      case "sydney":
        return "Sydney";
      case "us-central":
        return "US Central";
      case "us-east":
        return "US East";
      case "us-south":
        return "US South";
      case "us-west":
        return "US West";
      default:
        return region;
    }
  },

  /**
   * Formats process uptime
   * @example format.uptime(process.uptime());
   *
   * @param {number} uptime Uptime timestamp, in seconds
   */

  uptime: uptime => {
    const date = new Date(uptime * 1000);
    const days = date.getUTCDate() - 1,
      hours = date.getUTCHours(),
      minutes = date.getUTCMinutes();
    const segments = [];
    if (days > 0) segments.push(`${days} day${days === 1 ? "" : "s"}`);
    if (hours > 0) segments.push(`${hours} hour${hours === 1 ? "" : "s"}`);
    if (minutes === 0) segments.push("Less than a minute");
    if (minutes > 0) segments.push(`${minutes} minute${minutes === 1 ? "" : "s"}`);
    const dateString = segments.join(", ");
    return dateString;
  },
};
