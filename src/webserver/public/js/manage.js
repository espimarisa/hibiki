/**
 * @fileoverview Guild manager
 * @description Manages a guildconfig via the API
 * @module webserver/public/manage
 */

"use strict";

// Gets the csrf token
const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

// Gets a server's config
async function getGuildConfig(id) {
  const body = await fetch(`/api/getGuildConfig/${id}`, {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then((res) => {
    if (res.status === 204) return {};
    return res.json().catch(() => {});
  });
  return body;
}

// Updates a config
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
      "CSRF-Token": token,
    },
  });
}

// Resets a config
async function resetGuildConfig(id) {
  return fetch(`/api/resetGuildConfig/${id}`, {
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
let multiCats;

// Listens on window load
window.addEventListener("load", async () => {
  const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");
  const commands = await fetch("../../api/getItems?commands=true", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then((res) => res.json().catch(() => {}));

  // Multiselect base options
  const baseOptions = {
    searchEnable: true,
  };

  // Multiselect handler for commands & categories
  multiCats = new Bulmaselect("disabledCmds", { ...baseOptions, options: commands });

  // Multiselect handler for channelArrays
  const multiChannelArrays = {
    ignoredLoggingChannels: new Bulmaselect("multiignoredLoggingChannels", { ...baseOptions }),
    snipingIgnore: new Bulmaselect("multisnipingIgnore", { ...baseOptions }),
  };

  // Multiselect handler for roleArrays
  const multiRoleArrays = {
    assignableRoles: new Bulmaselect("multiassignableRoles", { ...baseOptions }),
    autoRoles: new Bulmaselect("multiautoRoles", { ...baseOptions }),
  };

  // Gets items and IDs
  const id = /manage\/([\d]{17,19})/.exec(document.URL)[1];
  const fetchedItems = await fetch("/api/getItems", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then((res) => res.json());
  const configItems = fetchedItems.map((p) => p.id);

  if (!id) return;
  let guildConfig = await getGuildConfig(id);
  oldcfg = { ...guildConfig };
  if (!guildConfig) guildConfig = {};

  // Slices content
  [document.getElementById("prefix"), document.getElementById("joinMessage"), document.getElementById("leaveMessage")].forEach((d) => {
    d.addEventListener("input", (starget) => {
      const e = starget.target;
      if (e.id === "prefix" && e.value.length > 15) e.value = e.value.substring(0, 15);
      else if (e.id === "joinMessage" && e.value.length > 200) e.value = e.value.substring(0, 200);
      else if (e.id === "leaveMessage" && e.value.length > 200) e.value = e.value.substring(0, 200);
    });
  });

  // Gets each element
  Object.keys(guildConfig).forEach((p) => {
    const element = document.getElementById(p);
    if ((!element && p !== "disabledCategories") || typeof guildConfig[p] === "undefined") return;
    const type = fetchedItems.find((pr) => pr.id === p).type;

    // Each type of item
    switch (type) {
      // Booleans
      case "bool": {
        if (guildConfig[p]) document.getElementById(`${p}_ON`).checked = true;
        else document.getElementById(`${p}_OFF`).checked = true;
        break;
      }

      // Numbers
      case "number": {
        document.getElementById(`${p}_Select`).value = guildConfig[p];
        break;
      }

      // Punishments
      case "punishment": {
        guildConfig[p].forEach((punishment) => {
          document.getElementById(`${p}_${punishment}`).checked = true;
        });
        break;
      }

      // Raid punishments
      case "raidPunishment": {
        const Ban = document.getElementById(`${p}_Ban`).checked;
        const Kick = document.getElementById(`${p}_Kick`).checked;
        const Mute = document.getElementById(`${p}_Mute`).checked;
        guildConfig[p] = [];
        if (Ban) guildConfig[p].push("Ban");
        if (Kick) guildConfig[p].push("Kick");
        if (Mute) guildConfig[p].push("Mute");
        break;
      }

      // Channel & roles
      case "channelID":
      case "roleID": {
        const opt = Array.from(element.children[0].children).find((a) => a.id === guildConfig[p]);
        if (!opt) return;
        document.getElementById(p).children[0].value = opt.innerText;
        break;
      }

      // Strings
      case "string": {
        element.value = guildConfig[p];
        break;
      }

      // Emojis
      case "emoji": {
        element.innerHTML = guildConfig[p];
        break;
      }

      // Rolearrays
      case "roleArray": {
        if (!multiRoleArrays[p]) return;
        if (typeof guildConfig[p] !== "object") guildConfig[p] = [guildConfig[p]];

        multiRoleArrays[p].options.forEach((s) => {
          const id = /.{1,32} \(([0-9]{16,19})\)/.exec(s.label)[1];
          if (guildConfig[p] && guildConfig[p].includes(id)) s.state = true;
        });

        break;
      }

      // Channelarrays
      case "channelArray": {
        if (!multiChannelArrays[p]) return;
        if (typeof guildConfig[p] !== "object") guildConfig[p] = [guildConfig[p]];

        multiChannelArrays[p].options.forEach((s) => {
          const id = /.{1,32} \(([0-9]{16,19})\)/.exec(s.label)[1];
          if (guildConfig[p] && guildConfig[p].includes(id)) s.state = true;
        });
        break;
      }
    }

    // Disabled command selector
    if (p === "disabledCmds") {
      multiCats.options.forEach((o) => {
        if (o.type === "group") {
          if (guildConfig.disabledCategories && guildConfig.disabledCategories.includes(o.label)) o.state = true;
          else {
            o.children.forEach((c) => {
              if (guildConfig.disabledCmds && guildConfig.disabledCmds.includes(c.label)) c.state = true;
            });
          }
        }
      });
    }
  });

  // Refreshes local guildConfig
  function refreshGuildConfig() {
    configItems.forEach((p) => {
      // Gets the items
      const type = fetchedItems.find((c) => c.id === p).type;
      const element = document.getElementById(p);
      if (!element) return;

      switch (type) {
        case "bool": {
          guildConfig[p] = document.getElementById(`${p}_ON`).checked;
          break;
        }

        case "number": {
          guildConfig[p] = parseInt(document.getElementById(`${p}_Select`).value.split(" ")[0]);
          break;
        }

        case "punishment": {
          const Purge = document.getElementById(`${p}_Purge`).checked;
          const Mute = document.getElementById(`${p}_Mute`).checked;
          const Warn = document.getElementById(`${p}_Warn`).checked;
          guildConfig[p] = [];
          if (Purge) guildConfig[p].push("Purge");
          if (Mute) guildConfig[p].push("Mute");
          if (Warn) guildConfig[p].push("Warn");
          break;
        }

        case "raidPunishment": {
          const Ban = document.getElementById(`${p}_Ban`).checked;
          const Kick = document.getElementById(`${p}_Kick`).checked;
          const Mute = document.getElementById(`${p}_Mute`).checked;
          guildConfig[p] = [];
          if (Ban) guildConfig[p].push("Ban");
          if (Kick) guildConfig[p].push("Kick");
          if (Mute) guildConfig[p].push("Mute");
          break;
        }

        case "channelID":
        case "roleID": {
          const r = Array.from(element.children[0].children).find((a) => a.innerText === element.children[0].value).id;
          if (!r || r.toLowerCase() === "none") return;
          guildConfig[p] = r;
          break;
        }

        case "string": {
          const val = element.value;
          if (val.length) guildConfig[p] = element.value;
          break;
        }

        case "emoji": {
          guildConfig[p] = element.innerHTML;
          break;
        }

        case "roleArray": {
          if (!multiRoleArrays[p]) return;
          const values = multiRoleArrays[p].getSelected().map((s) => s.label);
          const ids = [];
          values.forEach((v) => {
            ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
          });
          guildConfig[p] = ids;
          break;
        }

        case "channelArray": {
          if (!multiChannelArrays[p]) return;
          const values = multiChannelArrays[p].getSelected().map((s) => s.label);
          const ids = [];
          values.forEach((v) => {
            ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
          });

          guildConfig[p] = ids;
          break;
        }
      }
    });

    // Selected disabled items
    if (!guildConfig.disabledCmds || !guildConfig.disabledCategories || Array.isArray(guildConfig.disabledCmds))
      guildConfig.disabledCmds = [];
    if (!guildConfig.disabledCmds || !guildConfig.disabledCategories || Array.isArray(guildConfig.disabledCategories))
      guildConfig.disabledCategories = [];
    multiCats.getSelected().forEach((o) => {
      if (o.type === "group") {
        if (o.state) guildConfig.disabledCategories.push(o.label);
        else o.children.forEach((c) => guildConfig.disabledCmds.push(c.label));
      }
    });
  }

  // Submission button functionality
  document.getElementById("submit").addEventListener("click", async () => {
    const button = document.getElementById("submit");
    // Loading animation
    button.classList.add("is-loading");
    refreshGuildConfig();
    oldcfg = { ...guildConfig };
    // Updates config
    updateGuildConfig(id, guildConfig).then((res) => {
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
    oldcfg = { ...guildConfig };
    // Updates config
    resetGuildConfig(id).then((res) => {
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
  function compareGuildConfig() {
    // Don't ask for confirmation on deletion
    if (guildConfig === { id: id }) return;
    refreshGuildConfig();

    // Compares objects; leave confirmation
    if (JSON.stringify(oldcfg) !== JSON.stringify(guildConfig))
      window.onbeforeunload = function () {
        return "Do you really want to leave?";
      };
    else window.onbeforeunload = null;
  }

  // Event listeners
  document.addEventListener("click", compareGuildConfig);
  document.addEventListener("input", compareGuildConfig);
});
