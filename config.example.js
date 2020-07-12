module.exports = {
  bot: {
    logchannel: "",
    homepage: "https://hibiki.app",
    owners: [""],
    prefixes: [""],
    status: "online",
    statuses: ["help", "guilds", "users", "version"],
    statustype: 3,
    statusurl: "https://twitch.tv/.",
    support: "gZEj4sM",
    token: "",
  },

  colors: {
    general: "#9194FF",
    error: "#FF0048",
    pinboard: "#3498DB",
    success: "#41FF70",
  },

  dashboard: {
    cookiesecret: "",
    secret: "",
    port: "",
    redirect_uri: "http://localhost:port/auth/callback",
  },

  options: {
    defaultImageFormat: "png",
    defaultImageSize: 512,
    maxShards: 1,
  },

  keys: {
    abuseipdb: "",
    dictionary: "",
    dbots: "",
    fortnite: "",
    github: "",
    ipinfo: "",
    maps: "",
    osu: "",
    sentry: "",
    steam: "",
    topgg: "",
    twitter: "",
    weather: "",
    weebsh: "",
  },

  rethink: {
    db: "hibiki",
    host: "",
    password: "",
    port: "",
    user: "",
    marriages: true,
    tables: [
      "blacklist", "economy", "guildcfg", "marriages", "monitoring",
      "mutecache", "points", "reminders", "steammonitor", "usercfg", "warnings",
      "session",
    ],
  },

  voting: {
    auth: "",
    port: "",
  },

};
