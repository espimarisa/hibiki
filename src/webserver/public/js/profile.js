"use strict";

/**
 * @fileoverview Profile manager
 * @description Manages a profile via the API
 * @param {string} id The profile ID to fetch
 * @module webserver/profile
 */

// Gets the csrf token and user ID
const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
const id = document.querySelector('meta[name="user-id"]').getAttribute("content");

// Gets a profile config
async function getProfileConfig(id) {
  const body = await fetch(`/api/getProfileConfig/${id}`, {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => {
    if (res.status === 204) return {};
    return res.json().catch(() => {});
  });
  return body;
}

// Updates a config
async function updateProfileConfig(id, cfg) {
  return fetch(`/api/updateProfileConfig/${id}`, {
    method: "post",
    credentials: "include",
    body: JSON.stringify(cfg),
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": token,
    },
  });
}

// Resets a config
async function resetProfileConfig(id) {
  return fetch(`/api/resetProfileConfig/${id}`, {
    method: "post",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "CSRF-Token": token,
    },
  });
}

let oldcfg;

// Listens on window load
window.addEventListener("load", async () => {
  // Gets items and IDs
  const fetchedItems = await fetch("/api/getItems?profile=true", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => res.json());
  const configItems = fetchedItems.map(p => p.id);

  if (!id) return;
  let profileConfig = await getProfileConfig(id);
  oldcfg = { ...profileConfig };
  if (!profileConfig) profileConfig = {};

  // Sets locale info
  const localeInfo = Intl.DateTimeFormat().resolvedOptions();
  document.getElementById("timezone").value = localeInfo.timeZone;

  // Slices content
  [document.getElementById("bio")].forEach(d => {
    d.addEventListener("input", starget => {
      const e = starget.target;
      if (e.id === "bio" && e.value.length > 200) e.value = e.value.substring(0, 200);
      // TODO: implement ad blocker here (view bio.js)
    });
  });

  // Gets each element
  Object.keys(profileConfig).forEach(p => {
    const element = document.getElementById(p);
    if (!element && p !== "disabledCategories") return;
    const type = fetchedItems.find(pr => pr.id === p).type;

    // Boolean checker
    if (type === "bool") {
      if (profileConfig[p]) document.getElementById(p).children[0].checked = true;
      else document.getElementById(p).children[0].checked = false;
    }

    // Checks number content
    if (type === "number") {
      document.getElementById(p).children[0].value = Array.from(document.getElementById(p).children[0].children).find(n => n.innerText.split(" ")[0] === `${profileConfig[p]}`)
        .innerText;
    }

    // Sets string; emoji as content
    if (type === "string") element.value = profileConfig[p];

    // Single string select
    if (type === "selection") {
      const opt = Array.from(element.children[0].children)[profileConfig[p]];
      if (!opt) return;
      document.getElementById(p).children[0].value = opt.innerText;
    }
  });

  // Refreshes local profileConfig
  function refreshProfileConfig() {
    configItems.forEach(p => {
      // Gets the items
      const type = fetchedItems.find(c => c.id === p).type;
      const element = document.getElementById(p);
      if (!element) return;

      // Sets booleans in profileConfig
      if (type === "bool") {
        profileConfig[p] = document.getElementById(p).children[0].checked;
      }

      // Sets numbers in profileConfig
      if (type === "number") {
        profileConfig[p] = parseInt(document.getElementById(p).children[0].value.split(" ")[0]);
      }

      // Sets string; emoji in profileConfig
      if (type === "string") profileConfig[p] = element.value;

      // Single string select
      if (type === "selection") {
        const pronouns = Array.from(element.children[0].children);
        const r = pronouns.indexOf(pronouns.find(a => a.innerText === element.children[0].value));
        profileConfig[p] = r;
      }

      // Locale info
      if (type === "autofill") {
        profileConfig[p] = localeInfo.timeZone;
      }
    });
  }

  // Submission button functionality
  document.getElementById("submit").addEventListener("click", async () => {
    const button = document.getElementById("submit");
    // Loading animation
    button.classList.add("is-loading");
    // Refreshes config
    refreshProfileConfig();
    oldcfg = { ...profileConfig };
    // Updates config
    updateProfileConfig(id, profileConfig).then(res => {
      if (res.status === 200 || res.status === 204) {
        // Button animation & changes
        button.classList.remove("is-loading");
        button.classList.add("is-success");
        document.getElementById("saved").innerText = "Changes saved";
        setTimeout(() => {
          document.getElementById("saved").innerText = "Save changes";
          button.classList.remove("is-success");
        }, 2000);
      } else {
        // Displays if error (user likely not authed)
        document.getElementById("saved").innerText = "Error, please refresh";
        button.classList.add("is-error");
        button.classList.remove("is-success");
      }
    });
  });

  // Deletion button functionality
  document.getElementById("delete").addEventListener("click", async () => {
    const button = document.getElementById("delete");
    // Loading animation
    button.classList.add("is-loading");
    oldcfg = { ...profileConfig };
    // Updates config
    resetProfileConfig(id).then(res => {
      if (res.status === 200) {
        // Button animation & changes
        button.classList.remove("is-loading");
        button.classList.remove("is-light");
        button.classList.add("is-danger");
        document.getElementById("reset").innerText = "Config reset";
        setTimeout(() => {
          document.getElementById("reset").innerText = "Reset config";
          button.classList.remove("is-danger");
        }, 2000);
      } else {
        // Displays if error (user likely not authed)
        document.getElementById("reset").innerText = "Error, please refresh";
        button.classList.add("is-error");
        button.classList.remove("is-danger");
      }

      // Force reloads the window
      return window.location.reload(true);
    });
  });

  // Config changes
  function compareProfileConfig() {
    // Don't ask for confirmation on deletion
    if (JSON.stringify(profileConfig === { id: id })) return;

    refreshProfileConfig();

    // Compares objects; leave confirmation
    if (JSON.stringify(oldcfg) !== JSON.stringify(guildConfig)) window.onbeforeunload = function() {
      return "Do you really want to leave?";
    };

    else window.onbeforeunload = null;
  }

  // Event listeners
  document.addEventListener("click", compareProfileConfig);
  document.addEventListener("input", compareProfileConfig);
});
