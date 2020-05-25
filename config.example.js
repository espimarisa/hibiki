module.exports = {
  config: {
    logchannel: "",
    homepage: "https://hibiki.app",
    owners: [""],
    prefixes: [""],
    statuses: ["totalusers", "totalguilds", "version"],
    statustype: 3,
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
    id: "",
    secret: "",
    port: "",
    redirect_uri: "http://localhost:port/login/callback",
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
    dsn: "",
    gametracker: "",
    github: "",
    ipinfo: "",
    maps: "",
    osu: "",
    steam: "",
    topgg: "",
    twitter: "",
    weather: "",
    weebsh: "",
    youtube: "",
  },

  rethink: {
    db: "hibiki",
    marriages: true,
    tables: ["blacklist", "economy", "guildcfg", "marriages", "mutecache", "points", "reminders", "steammonitor", "usercfg", "warnings"],
  },

  voting: {
    auth: "",
    port: "",
  },

};
