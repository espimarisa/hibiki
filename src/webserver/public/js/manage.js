/**
 * @fileoverview Guild manager
 * @description Manages a guildconfig via the API
 * @module webserver/public/manage
 */

"use strict";

// Gets the csrf token, guild ID, and some locales
const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
const saveChanges = document.querySelector('meta[name="save-changes"').getAttribute("content");
const changesSaved = document.querySelector('meta[name="changes-saved"').getAttribute("content");
const guildID = /manage\/([\d]{17,19})/.exec(document.URL)[1];
const defaultEmojiRegex = /\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff]/;

/**
 * Gets a guildConfig
 * TODO: Stop doing this when we figure out how to SSR Bulmaselect
 */

async function getGuildConfig(id) {
  const body = await fetch(`/api/getGuildConfig/${id}`, {
    credentials: "include",
    headers: {
      "CSRF-Token": csrfToken,
    },
  }).then((res) => {
    if (res.status === 204) return {};
    return res.json().catch(() => {});
  });

  return body;
}

/**
 * Updates a guildConfig
 */

async function updateGuildConfig(id, cfg) {
  Object.keys(cfg).forEach((item) => {
    if (cfg[item] === null) delete cfg[item];
  });

  return fetch(`/api/updateGuildConfig/${id}`, {
    method: "post",
    credentials: "include",
    body: JSON.stringify(cfg),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
  });
}

/**
 * Deletes a guildConfig
 */

async function deleteGuildConfig(id) {
  return fetch(`/api/deleteGuildConfig/${id}`, {
    method: "post",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
  });
}

let multiCats;

// Listens on window load
window.addEventListener("load", async () => {
  const commands = await fetch("../../api/getItems?commands=true", {
    credentials: "include",
    headers: {
      "CSRF-Token": csrfToken,
    },
  }).then((res) => res.json().catch(() => {}));

  const baseOptions = {
    searchEnable: true,
  };

  // Creates a new Bulmaselect instance for disabled commands/categories
  multiCats = new Bulmaselect("disabledCmds", { ...baseOptions, options: commands });

  // Creates a new Bulmaselect instance for channelArrays
  const multiChannelArrays = {
    // lmao @ hardcoded
    ignoredLoggingChannels: new Bulmaselect("multiignoredLoggingChannels", { ...baseOptions }),
    snipingIgnore: new Bulmaselect("multisnipingIgnore", { ...baseOptions }),
  };

  // Creates a new Bulmaselect instance for roleArrays
  const multiRoleArrays = {
    assignableRoles: new Bulmaselect("multiassignableRoles", { ...baseOptions }),
    autoRoles: new Bulmaselect("multiautoRoles", { ...baseOptions }),
  };

  // Gets items and IDs
  const fetchedItems = await fetch("/api/getItems?manage=true", {
    credentials: "include",
    headers: {
      "CSRF-Token": csrfToken,
    },
  }).then((res) => res.json());

  const configItems = fetchedItems.map((item) => item.id);
  if (!guildID) return;
  let guildConfig = await getGuildConfig(guildID);
  if (!guildConfig) guildConfig = {};

  // Handles items with maximum limits
  fetchedItems
    .filter((item) => item.type === "string" || item.type === "emoji")
    .map((item) => document.getElementById(item.id))
    .forEach((e) => {
      const item = fetchedItems.find((item_) => item_.id === e.id);
      e.addEventListener("input", (setting) => {
        const element = setting.target;
        if (element.value.length > item.maximum) element.value = element.value.substring(0, item.maximum);

        // Emojis
        if (item.type === "emoji") {
          const emoji = defaultEmojiRegex.exec(element.value);
          if (emoji) element.value = element.value.substring(emoji.index, emoji[0].length + 1);
          else element.value = "";
        }
      });
    });

  /**
   * Sets item content to the guildConfig values
   * TODO: Figure out how the fuck to SSR Bulmaselect so we can remove this junk
   */

  Object.keys(guildConfig).forEach((setting) => {
    const element = document.getElementById(setting);
    if ((!element && setting !== "disabledCategories") || typeof guildConfig[setting] === "undefined") return;

    // Disabled command selector
    if (setting === "disabledCmds") {
      multiCats.config.options.forEach((option) => {
        if (option.type === "group") {
          if (guildConfig.disabledCategories && guildConfig.disabledCategories.includes(option.label)) option.state = true;
          else {
            option.children.forEach((c) => {
              if (guildConfig.disabledCmds && guildConfig.disabledCmds.includes(c.label)) c.state = true;
            });
          }
        }
      });
    }
  });

  /**
   * Refreshes the local guildConfig
   */

  function refreshGuildConfig() {
    configItems.forEach((item) => {
      // Gets the items
      const type = fetchedItems.find((c) => c.id === item).type;
      const element = document.getElementById(item);
      if (!element) return;

      switch (type) {
        // Booleans
        case "boolean": {
          guildConfig[item] = document.getElementById(`${item}_ON`).checked;
          break;
        }

        // Numbers
        case "number": {
          guildConfig[item] = parseInt(document.getElementById(`${item}_Select`).value.split(" ")[0]);
          break;
        }

        // Automod punishments
        case "punishment": {
          const purge = document.getElementById(`${item}_Purge`).checked;
          const mute = document.getElementById(`${item}_Mute`).checked;
          const warn = document.getElementById(`${item}_Warn`).checked;
          guildConfig[item] = [];
          if (purge) guildConfig[item].push("Purge");
          if (mute) guildConfig[item].push("Mute");
          if (warn) guildConfig[item].push("Warn");
          break;
        }

        // Automod raid punishments
        case "raidPunishment": {
          const ban = document.getElementById(`${item}_Ban`).checked;
          const kick = document.getElementById(`${item}_Kick`).checked;
          const mute = document.getElementById(`${item}_Mute`).checked;
          guildConfig[item] = [];
          if (ban) guildConfig[item].push("Ban");
          if (kick) guildConfig[item].push("Kick");
          if (mute) guildConfig[item].push("Mute");
          break;
        }

        // Channel & roles
        case "channel":
        case "voiceChannel":
        case "role": {
          const option = Array.from(element.children[0].children).find((a) => a.innerText === element.children[0].value).id;
          if (!option || option.toLowerCase() === "none") return;
          guildConfig[item] = option;
          break;
        }

        // Strings
        case "string": {
          const value = element.value;
          if (value && value.length) guildConfig[item] = element.value;
          break;
        }

        // Locale
        case "locale": {
          const locale = Array.from(element.children[0].children).find((a) => a.innerText === element.children[0].value).id;
          if (!locale) return;
          guildConfig[item] = locale;
          break;
        }

        // Emoji
        case "emoji": {
          guildConfig[item] = element.value;
          break;
        }

        // Role arrays
        case "roleArray": {
          if (!multiRoleArrays[item]) return;
          const values = multiRoleArrays[item].getSelected().map((s) => s.id);
          guildConfig[item] = values;
          break;
        }

        // Channel arrays
        case "channelArray": {
          if (!multiChannelArrays[item]) return;
          const values = multiChannelArrays[item].getSelected().map((s) => s.id);
          guildConfig[item] = values;
          break;
        }
      }
    });

    // Selected disabled items
    if (!guildConfig.disabledCmds || !guildConfig.disabledCategories || Array.isArray(guildConfig.disabledCmds)) {
      guildConfig.disabledCmds = [];
    }

    if (!guildConfig.disabledCmds || !guildConfig.disabledCategories || Array.isArray(guildConfig.disabledCategories)) {
      guildConfig.disabledCategories = [];
    }

    multiCats.getSelected().forEach((option) => {
      if (option.type === "group") {
        if (option.state) guildConfig.disabledCategories.push(option.label);
        else option.children.forEach((c) => guildConfig.disabledCmds.push(c.label));
      }
    });
  }

  /**
   * Submission button functionality
   */

  document.getElementById("submit").addEventListener("click", async () => {
    // Gets submission button
    const button = document.getElementById("submit");

    // Loading animation
    button.classList.add("is-loading");
    refreshGuildConfig();

    // Updates the guildConfig
    updateGuildConfig(guildID, guildConfig).then((res) => {
      if (res.status === 200 || res.status === 204) {
        // Makes the button "animated"
        button.classList.remove("is-loading");
        button.classList.add("is-success");
        document.getElementById("saved").innerText = changesSaved;
        setTimeout(() => {
          // Sets the button back to the original text
          document.getElementById("saved").innerText = saveChanges;
          button.classList.remove("is-success");
        }, 2000);
      }
    });
  });

  /**
   * Deletion button functionality
   */

  document.getElementById("delete").addEventListener("click", async () => {
    const button = document.getElementById("delete");
    // Loading animation
    button.classList.add("is-loading");

    // Deletes the guildConfig
    deleteGuildConfig(guildID).then((res) => {
      if (res.status === 200) {
        // "Animates" the deletion button
        button.classList.remove("is-loading");
        button.classList.remove("is-light");
        button.classList.add("is-danger");
      }

      // "Reloads" the window (in a non-deprecated way)
      return window.location.replace(window.location.href.replace("#", ""));
    });
  });
});
