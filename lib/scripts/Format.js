module.exports = {
  // Formats statuses
  status: status => {
    switch (status) {
      case "online":
        return "🟢 Online";
      case "idle":
        return "🟡 Idle";
      case "dnd":
        return "🔴 Do Not Disturb";
      case "offline":
        return "⚪ Invisible/Offline";
      default:
        return status;
    }
  },

  // Tags a user by user#disc; replaces emojis if needed
  tag: (user, emojifilter = true) => {
    if (user && emojifilter == true) {
      return `${/[,.\-_a-zA-Z0-9 ]{1,32}/.exec(user.username) !== null ? /[,.\-_a-zA-Z0-9 ]{1,32}/.exec(user.username)[0] : user.id}#${user.discriminator}`;
    } else if (user && emojifilter == false) {
      return `${user.username}#${user.discriminator}`;
    }
    return undefined;
  },

  // Explicit content filter settings
  contentfilter: contentfilter => {
    switch (contentfilter) {
      case 0:
        return "Content filter off";
      case 1:
        return "Roleless messages filtered";
      case 2:
        return "All messages are filtered";
      default:
        return "Unknown";
    }
  },

  // Nitro Boost guild features
  featureParse: (features) => {
    if (!features) return undefined;
    return features.map(feature => {
      switch (feature) {
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

  // 2FA options
  mfaLevel: mfaLevel => {
    switch (mfaLevel) {
      case 0:
        return "2FA disabled";
      case 1:
        return "2FA enabled";
      default:
        return "Unknown";
    }
  },

  // Notification settings
  notifsettings: notifsettings => {
    switch (notifsettings) {
      case 0:
        return "All messages notify";
      case 1:
        return "Only role mentions notify";
      default:
        return "Unknown";
    }
  },

  // Server regions
  region: region => {
    switch (region) {
      case "amsterdam":
        return "Amsterdam";
      case "brazil":
        return "Brazil";
      case "eu-central":
        return "Central Europe";
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
      case "eu-west":
        return "Western Europe";
      default:
        return region;
    }
  },

  // Nitro boost tier levels
  tierlevel: tierlevel => {
    switch (tierlevel) {
      case 0:
        return "Boost level 0";
      case 1:
        return "Boost level 1";
      case 2:
        return "Boost level 2";
      case 3:
        return "Boost level 3";
      default:
        return "Unknown";
    }
  },

  // Server verification level
  verificationlevel: verificationlevel => {
    switch (verificationlevel) {
      case 0:
        return "No verification";
      case 1:
        return "Low verification";
      case 2:
        return "Medium verification";
      case 3:
        return "High verification";
      case 4:
        return "Highest verification";
      default:
        return "Unknown";
    }
  },

  // Formats OS platform
  formatOs: (platform, release) => {
    switch (platform) {
      case "darwin":
        return `macOS ${(parseFloat(release).toFixed(2) - parseFloat("7.6").toFixed(2) + parseFloat("0.03")).toFixed(2)}`;
      case "linux":
        return `Linux ${release}`;
      case "win32":
        return `Windows ${release}`;
      default:
        return platform;
    }
  },

  // Makes dates look nicer
  prettyDate: (EpochDate, syear = true) => {
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

  // Formats uptime
  uptimeFormat: () => {
    let uptime = process.uptime();
    const date = new Date(uptime * 1000);
    const days = date.getUTCDate() - 1,
      hours = date.getUTCHours(),
      minutes = date.getUTCMinutes();
    let segments = [];
    if (days > 0) segments.push(`${days} day${days == 1 ? "" : "s"}`);
    if (hours > 0) segments.push(`${hours} hour${hours == 1 ? "" : "s"}`);
    if (minutes === 0) segments.push("Less than a minute");
    if (minutes > 0) segments.push(`${minutes} minute${minutes == 1 ? "" : "s"}`);
    const dateString = segments.join(", ");
    return dateString;
  },

  // Prettier categories
  categoryEmoji(category) {
    let label;
    switch (category) {
      case "Core":
        label = "🤖 Core";
        break;
      case "Fun":
        label = "🎉 Fun";
        break;
      case "Misc":
        label = "❓ Misc";
        break;
      case "Moderation":
        label = "🔨 Moderation";
        break;
      case "NSFW":
        label = "🔞 NSFW";
        break;
      case "Owner":
        label = "⛔ Owner";
        break;
      default:
        label = "Unknown";
        break;
    }
    return label;
  }
};
