"use strict";

/**
 * @fileoverview Guild manager
 * @description Manages a guildconfig via the API
 * @param {string} id The guild ID to fetch
 * @module webserver/manage
 */

// Gets the csrf token
const token = document.querySelector('meta[name="csrf-token"]').getAttribute("content");

// Gets a server's config
async function getGuildConfig(id) {
  const body = await fetch(`/api/getGuildConfig/${id}`, {
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
async function updateGuildConfig(id, cfg) {
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
  }).then(res => res.json().catch(() => {}));

  // Multiselect base options
  const baseOptions = {
    searchEnable: true,
  };

  // Multiselect handler for commands & categories
  multiCats = new Bulmaselect("disabledCmds", { ...baseOptions, options: commands });

  // Multiselect handler for channelArrays
  const multiChannelArrays = {
    ignoredLoggingChannels: new Bulmaselect("multiIgnoredChannels", { ...baseOptions }),
    snipingIgnore: new Bulmaselect("multiSnipingIgnore", { ...baseOptions }),
  };

  // Multiselect handler for roleArrays
  const multiRoleArrays = {
    assignableRoles: new Bulmaselect("multiAssignableRoles", { ...baseOptions }),
    autoRoles: new Bulmaselect("multiAutomaticRoles", { ...baseOptions }),
  };

  // Gets items and IDs
  const id = /manage\/([\d]{17,19})/.exec(document.URL)[1];
  const fetchedItems = await fetch("/api/getItems", {
    credentials: "include",
    headers: {
      "CSRF-Token": token,
    },
  }).then(res => res.json());
  const configItems = fetchedItems.map(p => p.id);

  if (!id) return;
  let guildConfig = await getGuildConfig(id);
  oldcfg = { ...guildConfig };
  if (!guildConfig) guildConfig = {};

  // Slices content
  [document.getElementById("prefix"), document.getElementById("joinMessage"), document.getElementById("leaveMessage")].forEach(d => {
    d.addEventListener("input", starget => {
      const e = starget.target;
      if (e.id === "prefix" && e.value.length > 15) e.value = e.value.substring(0, 15);
      if (e.id === "joinMessage" && e.value.length > 200) e.value = e.value.substring(0, 200);
      if (e.id === "leaveMessage" && e.value.length > 200) e.value = e.value.substring(0, 200);
    });
  });

  // Gets each element
  Object.keys(guildConfig).forEach(p => {
    const element = document.getElementById(p);
    if (!element && p !== "disabledCategories") return;
    const type = fetchedItems.find(pr => pr.id === p).type;

    // Boolean checker
    if (type === "bool") {
      if (guildConfig[p]) document.getElementById(p).children[0].children[0].checked = true;
      else document.getElementById(p).children[1].children[0].checked = true;
    }

    // Checks number content
    if (type === "number") {
      document.getElementById(p).children[0].value = Array.from(document.getElementById(p).children[0].children).find(n => n.innerText.split(" ")[0] === `${guildConfig[p]}`)
        .innerText;
    }

    // Checks for ticked punishments
    if (type === "punishment") {
      guildConfig[p].forEach(punishment => {
        if (punishment === "Purge") document.getElementById(p).children[0].checked = true;
        if (punishment === "Mute") document.getElementById(p).children[2].checked = true;
        if (punishment === "Warn") document.getElementById(p).children[4].checked = true;
      });
    }

    // Gets the channel/roleID from content
    if (type === "channelID" || type === "roleID") {
      const opt = Array.from(element.children[0].children).find(a => a.id === guildConfig[p]);
      if (!opt) return;
      document.getElementById(p).children[0].value = opt.innerText;
    }

    // Sets string; emoji as content
    if (type === "string") element.value = guildConfig[p];
    if (type === "emoji") element.innerHTML = guildConfig[p];

    // Sets RoleArray as content
    if (type === "roleArray") {
      if (!multiRoleArrays[p]) return;
      if (typeof guildConfig[p] !== "object") guildConfig[p] = [guildConfig[p]];

      multiRoleArrays[p].options.forEach(s => {
        const id = /.{1,32} \(([0-9]{16,19})\)/.exec(s.label)[1];
        if (guildConfig[p] && guildConfig[p].includes(id)) s.state = true;
      });
    }

    // Sets ChannelArray as content
    if (type === "channelArray") {
      if (!multiChannelArrays[p]) return;
      if (typeof guildConfig[p] !== "object") guildConfig[p] = [guildConfig[p]];

      multiChannelArrays[p].options.forEach(s => {
        const id = /.{1,32} \(([0-9]{16,19})\)/.exec(s.label)[1];
        if (guildConfig[p] && guildConfig[p].includes(id)) s.state = true;
      });
    }

    // Disabled command selector
    if (p === "disabledCmds") {
      multiCats.options.forEach(o => {
        if (o.type === "group") {
          if (guildConfig.disabledCategories && guildConfig.disabledCategories.includes(o.label)) o.state = true;
          else o.children.forEach(c => {
            if (guildConfig.disabledCmds && guildConfig.disabledCmds.includes(c.label)) c.state = true;
          });
        }
      });
    }
  });

  // Refreshes local guildConfig
  function refreshGuildConfig() {
    configItems.forEach(p => {
      // Gets the items
      const type = fetchedItems.find(c => c.id === p).type;
      const element = document.getElementById(p);
      if (!element) return;

      // Sets booleans in guildConfig
      if (type === "bool") {
        guildConfig[p] = document.getElementById(p).children[0].children[0].checked;
      }

      // Sets numbers in guildConfig
      if (type === "number") {
        guildConfig[p] = parseInt(document.getElementById(p).children[0].value.split(" ")[0]);
      }

      // Sets punishment types in guildConfig
      if (type === "punishment") {
        const Purge = document.getElementById(p).children[0].checked;
        const Mute = document.getElementById(p).children[2].checked;
        const Warn = document.getElementById(p).children[4].checked;
        guildConfig[p] = [];
        if (Purge) guildConfig[p].push("Purge");
        if (Mute) guildConfig[p].push("Mute");
        if (Warn) guildConfig[p].push("Warn");
      }

      // Sets channels/roles in guildConfig
      if (type === "channelID" || type === "roleID") {
        const r = Array.from(element.children[0].children).find(a => a.innerText === element.children[0].value).id;
        guildConfig[p] = !r || r.toLowerCase() === "none" ? null : r;
      }

      // Sets string; emoji in guildConfig
      if (type === "string") guildConfig[p] = element.value;
      if (type === "emoji") guildConfig[p] = element.innerHTML;

      // Sets roles in guildConfig
      if (type === "roleArray") {
        if (!multiRoleArrays[p]) return;
        const values = multiRoleArrays[p].getSelected().map(s => s.label);
        const ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        guildConfig[p] = ids;
      }

      // Sets channels in guildConfig
      if (type === "channelArray") {
        if (!multiChannelArrays[p]) return;
        const values = multiChannelArrays[p].getSelected().map(s => s.label);
        const ids = [];
        values.forEach(v => {
          ids.push(/.{1,32} \(([0-9]{16,19})\)/.exec(v)[1]);
        });
        guildConfig[p] = ids;
      }
    });

    // Selected disabled items
    if (!guildConfig.disabledCmds || !guildConfig.disabledCategories || Array.isArray(guildConfig.disabledCmds)) guildConfig.disabledCmds = [];
    if (!guildConfig.disabledCmds || !guildConfig.disabledCategories || Array.isArray(guildConfig.disabledCategories)) guildConfig.disabledCategories = [];
    multiCats.getSelected().forEach(o => {
      if (o.type === "group") {
        if (o.state) guildConfig.disabledCategories.push(o.label);
        else o.children.forEach(c => guildConfig.disabledCmds.push(c.label));
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
    updateGuildConfig(id, guildConfig).then(res => {
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
    resetGuildConfig(id).then(res => {
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
    if (JSON.stringify(guildConfig === { id: id })) return;

    refreshGuildConfig();

    // Compares objects; leave confirmation
    if (JSON.stringify(oldcfg) !== JSON.stringify(guildConfig)) window.onbeforeunload = function() {
      return "Do you really want to leave?";
    };

    else window.onbeforeunload = null;
  }

  // Event listeners
  document.addEventListener("click", compareGuildConfig);
  document.addEventListener("input", compareGuildConfig);
});
